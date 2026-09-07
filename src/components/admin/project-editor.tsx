"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Category, MediaAsset } from "@prisma/client";
import { Field } from "./field";
import { SortableList } from "./sortable";
import { Upload,uploadFile } from "./upload";
import { Dialog } from "./dialog";
import { Toast } from "./toast";
import { Artwork } from "@/components/ui/artwork";
import { layouts, type ProjectInput } from "@/lib/validation";
import { slugify } from "@/features/projects/domain";
import { saveProject } from "@/features/projects/actions";
import { updateAlt } from "@/features/media/actions";
export function ProjectEditor({
  id,
  initial,
  categories,
  media: initialMedia,
}: {
  id: string | null;
  initial: ProjectInput;
  categories: Category[];
  media: MediaAsset[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState(initial.title);
  const [status, setStatus] = useState(initial.status);
  const [featured, setFeatured] = useState(initial.featured);
  const [category, setCategory] = useState(initial.categoryId);
  const [slug, setSlug] = useState(initial.slug);
  const [manualSlug, setManualSlug] = useState(!!id);
  const [cover, setCover] = useState(initial.coverImageId ?? "");
  const [media, setMedia] = useState(initialMedia);
  const [gallery, setGallery] = useState(
    initial.gallery.map((g) => ({ ...g, id: g.mediaId })),
  );
  const [picker, setPicker] = useState<"cover" | "gallery" | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const coverAsset = media.find((m) => m.id === cover);
  const editingAsset = media.find((m) => m.id === editing);
  const editingGallery = gallery.find((g) => g.id === editing);
  function choose(asset: MediaAsset) {
    if (picker === "cover") setCover(asset.id);
    else
      setGallery((items) =>
        items.some((g) => g.id === asset.id)
          ? items
          : [
              ...items,
              { id: asset.id, mediaId: asset.id, caption: "", layout: "LARGE" },
            ],
      );
    setPicker(null);
  }
  function patchGallery(patch: Partial<ProjectInput["gallery"][number]>) {
    setGallery((items) =>
      items.map((g) => (g.id === editing ? { ...g, ...patch } : g)),
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const value = (key: string) => String(data.get(key) ?? "");
        const list = (key: string) =>
          value(key)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        const submitter = (e.nativeEvent as SubmitEvent)
          .submitter as HTMLButtonElement | null;
        const savedStatus = (submitter?.value ||
          status) as ProjectInput["status"];
        start(async () => {
          setMessage("");
          const result = await saveProject(id, {
            title,
            slug,
            categoryId: category,
            year: Number(value("year")),
            shortDescription: value("shortDescription"),
            projectContext: value("projectContext"),
            brief: value("brief"),
            direction: value("direction"),
            result: value("result"),
            titleLines: value("titleLines"),
            homeLayout: value("homeLayout") as ProjectInput["homeLayout"],
            artworkAspect: value(
              "artworkAspect",
            ) as ProjectInput["artworkAspect"],
            role: value("role"),
            disciplines: list("disciplines"),
            tools: list("tools"),
            coverImageId: cover || null,
            gallery: gallery.map(({ mediaId, caption, layout }) => ({
              mediaId,
              caption,
              layout,
            })),
            featured,
            status: savedStatus,
            sortOrder: Number(value("sortOrder")),
            seoTitle: value("seoTitle"),
            seoDescription: value("seoDescription"),
          });
          if (!result.ok) setMessage(result.error);
          else {
            setMessage("Project saved.");
            setStatus(savedStatus);
            if (!id) router.replace("/admin/projects/" + result.id);
            router.refresh();
          }
        });
      }}
    >
      <div className="view-head">
        <h1>{id ? title || "Edit project" : "New project"}</h1>
        {id && (
          <Link
            className="btn ghost"
            target="_blank"
            href={"/admin/preview/" + id}
          >
            Preview ↗
          </Link>
        )}
      </div>
      {!categories.length && (
        <p className="form-error">
          Add a category in Settings before creating a project.
        </p>
      )}
      <fieldset disabled={pending} className="plain-fieldset">
        <div className="form-grid">
          <div>
            <section className="form-section">
              <span className="fs-label eyebrow">Project details</span>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="project-title">Title</label>
                  <input
                    id="project-title"
                    name="title"
                    required
                    value={title}
                    maxLength={180}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!manualSlug) setSlug(slugify(e.target.value));
                    }}
                  />
                </div>
                <div className="field">
                  <label htmlFor="project-slug">Slug</label>
                  <input
                    id="project-slug"
                    name="slug"
                    required
                    value={slug}
                    onChange={(e) => {
                      setManualSlug(true);
                      setSlug(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="field">
                <label>Category</label>
                <div className="chip-select" role="group" aria-label="Category">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={category === c.id}
                      className={category === c.id ? "is-active" : ""}
                      onClick={() => setCategory(c.id)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <Field label="Role" name="role" value={initial.role} />
                <Field
                  label="Year"
                  name="year"
                  type="number"
                  value={initial.year}
                  required
                />
              </div>
              <Field
                label="Tools / Discipline"
                name="disciplines"
                value={initial.disciplines.join(", ")}
              />
              <Field
                label="Short description"
                name="shortDescription"
                value={initial.shortDescription}
                multiline
              />
            </section>
            <section className="form-section">
              <span className="fs-label eyebrow">Project context</span>
              <Field
                label="Brief"
                name="brief"
                value={initial.brief || initial.projectContext}
                multiline
              />
              <Field
                label="Direction"
                name="direction"
                value={initial.direction}
                multiline
              />
              <Field
                label="Result"
                name="result"
                value={initial.result}
                multiline
              />
            </section>
            <section className="form-section">
              <span className="fs-label eyebrow">Cover artwork</span>
              <button
                type="button"
                className="dropzone"
                onDragOver={e=>e.preventDefault()}
                onDrop={e=>{e.preventDefault();const file=e.dataTransfer.files[0];if(!file)return;start(async()=>{setMessage("");try{const asset=await uploadFile(file);setMedia(items=>[asset,...items]);setCover(asset.id)}catch{setMessage("Upload failed. Check the file format and size.")}})}}
                style={{ width: "100%" }}
                onClick={() => setPicker("cover")}
                aria-label={
                  coverAsset ? "Replace cover artwork" : "Upload cover artwork"
                }
              >
                {coverAsset ? (
                  <Artwork image={coverAsset} />
                ) : (
                  <span className="dz-copy">
                    <span className="dz-title">
                      Drop artwork here, or click to upload
                    </span>
                    <span className="dz-sub">
                      JPG, PNG, WebP or AVIF / Max 20 MB
                    </span>
                  </span>
                )}
              </button>
              {coverAsset && (
                <div className="inline-actions">
                  <button
                    type="button"
                    className="text-action"
                    onClick={() => setEditing(cover)}
                  >
                    Edit alt text
                  </button>
                  <button
                    type="button"
                    className="text-action"
                    onClick={() => setCover("")}
                  >
                    Remove cover
                  </button>
                </div>
              )}
            </section>
            <section className="form-section">
              <span className="fs-label eyebrow">Gallery</span>
              <div className="gallery-grid">
                <SortableList items={gallery} onChange={setGallery} grid>
                  {(g, handle) => {
                    const asset = media.find((m) => m.id === g.mediaId);
                    return (
                      <div className="gallery-tile">
                        <button
                          className="tile-edit"
                          type="button"
                          onClick={() => setEditing(g.id)}
                          aria-label={
                            "Edit gallery image " + (asset?.fileName ?? "")
                          }
                        >
                          {asset && <Artwork image={asset} />}
                        </button>
                        <span className="grip">{handle}</span>
                        <button
                          type="button"
                          className="g-del"
                          aria-label="Remove from gallery"
                          onClick={() =>
                            setGallery((items) =>
                              items.filter((item) => item.id !== g.id),
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    );
                  }}
                </SortableList>
                <button
                  type="button"
                  className="gallery-tile add"
                  aria-label="Add gallery image"
                  onClick={() => setPicker("gallery")}
                >
                  +
                </button>
              </div>
            </section>
            <details>
              <summary>Typography / Tools / Search metadata</summary>
              <Field
                label="Title with manual line breaks"
                name="titleLines"
                value={initial.titleLines}
                multiline
              />
              <Field
                label="Tools (comma separated)"
                name="tools"
                value={initial.tools.join(", ")}
              />
              <Field
                label="Legacy project context"
                name="projectContext"
                value={initial.projectContext}
                multiline
              />
              <Field
                label="SEO title"
                name="seoTitle"
                value={initial.seoTitle}
              />
              <Field
                label="SEO description"
                name="seoDescription"
                value={initial.seoDescription}
                multiline
              />
            </details>
          </div>
          <aside>
            <div className="sidebar-card">
              <span className="sc-label eyebrow">Status</span>
              <div className="segmented" role="group" aria-label="Status">
                {(["DRAFT", "PUBLISHED"] as const).map((s) => (
                  <button
                    type="button"
                    key={s}
                    aria-pressed={status === s}
                    className={status === s ? "is-active" : ""}
                    onClick={() => setStatus(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {status === "ARCHIVED" && (
                <p className="field-note">
                  Archived / Select Draft to restore.
                </p>
              )}
            </div>
            <div className="sidebar-card">
              <span className="sc-label eyebrow">Featured on home</span>
              <div
                className="segmented"
                role="group"
                aria-label="Featured on home"
              >
                {[false, true].map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    aria-pressed={featured === v}
                    className={featured === v ? "is-active" : ""}
                    onClick={() => setFeatured(v)}
                  >
                    {v ? "Yes" : "No"}
                  </button>
                ))}
              </div>
            </div>
            <div className="sidebar-card">
              <Field
                label="Project order"
                name="sortOrder"
                type="number"
                value={initial.sortOrder}
              />
              <details>
                <summary>Artwork layout</summary>
                <div className="field">
                  <label htmlFor="home-layout">Home composition</label>
                  <select
                    id="home-layout"
                    name="homeLayout"
                    defaultValue={initial.homeLayout ?? "A"}
                  >
                    {["A", "B", "C", "D"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="artwork-aspect">Artwork aspect</label>
                  <select
                    id="artwork-aspect"
                    name="artworkAspect"
                    defaultValue={initial.artworkAspect ?? "PORTRAIT"}
                  >
                    {["PORTRAIT", "LANDSCAPE", "SQUARE", "WIDE"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </details>
            </div>
            <div className="sidebar-card">
              <span className="sc-label eyebrow">Preview</span>
              {coverAsset ? (
                <div className="editor-preview">
                  <Artwork image={coverAsset} />
                </div>
              ) : (
                <p className="field-note">Add cover artwork to preview.</p>
              )}
            </div>
          </aside>
        </div>
      </fieldset>
      <Toast message={message==="Project saved."?message:""}/>
      {message && message!=="Project saved." && (
        <p
          role="status"
          className={message === "Project saved." ? "notice" : "form-error"}
        >
          {message}
        </p>
      )}
      <div className="save-bar">
        <Link className="btn ghost" href="/admin/projects">
          Cancel
        </Link>
        <div className="inline-actions">
          <button
            className="btn ghost"
            disabled={pending || !categories.length}
            value="DRAFT"
          >
            Save draft
          </button>
          <button
            className="btn primary"
            disabled={pending || !categories.length}
            value="PUBLISHED"
          >
            Publish
          </button>
        </div>
      </div>
      {picker && (
        <Dialog
          title={
            picker === "cover" ? "Choose cover artwork" : "Add gallery image"
          }
          onClose={() => setPicker(null)}
        >
          <Upload
            onUploaded={(asset) => {
              setMedia((items) => [asset, ...items]);
              choose(asset);
            }}
          />
          <div className="media-grid">
            {media
              .filter(
                (m) =>
                  picker === "cover" ||
                  !gallery.some((g) => g.mediaId === m.id),
              )
              .map((m) => (
                <button
                  type="button"
                  className="media-tile"
                  key={m.id}
                  onClick={() => choose(m)}
                  aria-label={"Select " + m.fileName}
                >
                  <Artwork image={m} />
                  <span className="m-meta">{m.fileName}</span>
                </button>
              ))}
          </div>
        </Dialog>
      )}
      {editingAsset && (
        <Dialog title="Artwork details" onClose={() => setEditing(null)}>
          <AltEditor asset={editingAsset} />
          {editingGallery && (
            <>
              <div className="field">
                <label htmlFor="gallery-caption">Caption</label>
                <input
                  id="gallery-caption"
                  value={editingGallery.caption}
                  onChange={(e) => patchGallery({ caption: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="gallery-layout">Layout hint</label>
                <select
                  id="gallery-layout"
                  value={editingGallery.layout}
                  onChange={(e) =>
                    patchGallery({
                      layout: e.target.value as typeof editingGallery.layout,
                    })
                  }
                >
                  {layouts.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              <p className="field-note">
                Caption, layout and gallery order save with the project.
              </p>
            </>
          )}
        </Dialog>
      )}
    </form>
  );
}
export function AltEditor({ asset }: { asset: MediaAsset }) {
  const [alt, setAlt] = useState(asset.altText);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  return (
    <div>
      <div className="field">
        <label htmlFor={"alt-" + asset.id}>Alt text</label>
        <input
          id={"alt-" + asset.id}
          value={alt}
          maxLength={500}
          onChange={(e) => setAlt(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="btn ghost"
        disabled={pending}
        onClick={() =>
          start(async () => {
            try {
              await updateAlt(asset.id, alt);
              setMessage("Alt text saved.");
            } catch {
              setMessage("Could not save alt text.");
            }
          })
        }
      >
        Save alt text
      </button>
      <p role="status">{message}</p>
    </div>
  );
}
