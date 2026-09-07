"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { MediaAsset } from "@prisma/client";
import { Upload } from "./upload";
import { Dialog } from "./dialog";
import { AltEditor } from "./project-editor";
import { Artwork } from "@/components/ui/artwork";
import { removeMedia, replaceMedia } from "@/features/media/actions";
export type LibraryAsset = MediaAsset & {
  usage: { id: string; title: string }[];
  usedBySettings: boolean;
};
export function MediaLibrary({ assets }: { assets: LibraryAsset[] }) {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const [upload, setUpload] = useState(false);
  const [editing, setEditing] = useState<LibraryAsset | null>(null);
  const [replacement, setReplacement] = useState<LibraryAsset | null>(null);
  const router = useRouter();
  function remove(a: LibraryAsset) {
    const confirmation = window.prompt(
      "Permanently delete this unused image? Type " +
        a.fileName +
        " to confirm.",
    );
    if (confirmation === null) return;
    start(async () => {
      try {
        await removeMedia(a.id, confirmation);
        setMessage("Image deleted.");
        router.refresh();
      } catch {
        setMessage(
          "Could not delete this image. Remove its project and Settings references first.",
        );
      }
    });
  }
  return (
    <>
      <details>
        <summary>Search library</summary>
        <div className="field">
          <label htmlFor="media-search">Search by file name</label>
          <input
            id="media-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </details>
      <div className="media-grid">
        {assets
          .filter((a) => a.fileName.toLowerCase().includes(query.toLowerCase()))
          .map((a) => (
            <article className="media-tile" key={a.id}>
              <Artwork image={a} />
              <div className="m-meta">
                {a.fileName}
                <br />
                {(a.fileSize / 1024 / 1024).toFixed(2)} MB
              </div>
              <div className="m-actions">
                <button type="button" onClick={() => setEditing(a)}>
                  Details
                </button>
                <button type="button" onClick={() => setReplacement(a)}>
                  Replace
                </button>
                <button
                  type="button"
                  disabled={pending || !!a.usage.length || a.usedBySettings}
                  onClick={() => remove(a)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        <button
          type="button"
          className="media-tile upload"
          onClick={() => setUpload(true)}
        >
          + Upload
        </button>
      </div>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {upload && (
        <Dialog title="Upload artwork" onClose={() => setUpload(false)}>
          <Upload
            onUploaded={() => {
              router.refresh();
              setMessage("Artwork uploaded.");
            }}
          />
        </Dialog>
      )}
      {replacement && (
        <Dialog
          title={"Replace " + replacement.fileName}
          onClose={() => setReplacement(null)}
        >
          <p className="field-note">
            The new artwork will replace this image everywhere it is used.
            Existing alt text is retained.
          </p>
          <Upload
            onUploaded={(asset) =>
              start(async () => {
                try {
                  await replaceMedia(replacement.id, asset.id);
                  setReplacement(null);
                  setMessage("Artwork replaced.");
                  router.refresh();
                } catch {
                  setMessage(
                    "Replacement could not be applied. The new upload remains in the library.",
                  );
                  router.refresh();
                }
              })
            }
          />
        </Dialog>
      )}
      {editing && (
        <Dialog title={editing.fileName} onClose={() => setEditing(null)}>
          <Artwork image={editing} />
          <p className="field-note">
            {editing.width} × {editing.height} / {editing.mimeType}
          </p>
          <AltEditor asset={editing} />
          {editing.usage.length > 0 && (
            <>
              <p className="eyebrow">Used by</p>
              <ul>
                {editing.usage.map((p) => (
                  <li key={p.id}>
                    <Link href={"/admin/projects/" + p.id}>{p.title}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          {editing.usedBySettings && (
            <p>Used as the default social image in Settings.</p>
          )}
          <div className="inline-actions">
            <button
              type="button"
              className="text-action"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(editing.url);
                  setMessage("Image URL copied.");
                } catch {
                  setMessage("Copy unavailable. Use Open image.");
                }
              }}
            >
              Copy URL
            </button>
            <a
              className="text-action"
              href={editing.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open image ↗
            </a>
          </div>
        </Dialog>
      )}
    </>
  );
}
