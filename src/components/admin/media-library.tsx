"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { MediaAsset } from "@prisma/client";
import { Upload } from "./upload";
import { Dialog } from "./dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { AltEditor } from "./project-editor";
import { Artwork } from "@/components/ui/artwork";
import {
  removeMedia,
  removeMediaBulk,
  replaceMedia,
} from "@/features/media/actions";

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
  const [deleting, setDeleting] = useState<LibraryAsset | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const router = useRouter();

  const visibleAssets = assets.filter((asset) =>
    asset.fileName.toLowerCase().includes(query.toLowerCase()),
  );
  const isDeletable = (asset: LibraryAsset) =>
    !asset.usage.length && !asset.usedBySettings;
  const selectableVisible = visibleAssets.filter(isDeletable);
  const selectedSet = new Set(selected);

  function toggleSelection(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  }

  function closeSelectionMode() {
    setSelecting(false);
    setSelected([]);
    setBulkConfirm(false);
  }

  function deleteOne(asset: LibraryAsset) {
    start(async () => {
      try {
        await removeMedia(asset.id);
        setDeleting(null);
        setMessage("Image deleted.");
        router.refresh();
      } catch {
        setMessage(
          "Could not delete this image. Remove its project and Settings references first.",
        );
      }
    });
  }

  function deleteSelected() {
    const ids = [...selected];
    start(async () => {
      try {
        await removeMediaBulk(ids);
        setBulkConfirm(false);
        setSelected([]);
        setSelecting(false);
        setMessage(
          `${ids.length} image${ids.length === 1 ? "" : "s"} deleted.`,
        );
        router.refresh();
      } catch {
        setMessage(
          "Bulk delete could not be completed. One or more selected images may now be in use.",
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
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </details>

      <div className="media-library-bar">
        <span className="media-library-count">
          {visibleAssets.length} shown / {assets.length} total
        </span>

        <div className="media-library-actions">
          {!selecting ? (
            <button
              type="button"
              className="text-action"
              onClick={() => setSelecting(true)}
            >
              Select media
            </button>
          ) : (
            <>
              <button
                type="button"
                className="text-action"
                disabled={!selectableVisible.length || pending}
                onClick={() =>
                  setSelected(selectableVisible.map((asset) => asset.id))
                }
              >
                Select visible unused
              </button>
              <button
                type="button"
                className="text-action"
                disabled={!selected.length || pending}
                onClick={() => setSelected([])}
              >
                Clear
              </button>
              <button
                type="button"
                className="text-action media-delete-action"
                disabled={!selected.length || pending}
                onClick={() => setBulkConfirm(true)}
              >
                Delete selected{selected.length ? ` (${selected.length})` : ""}
              </button>
              <button
                type="button"
                className="text-action"
                disabled={pending}
                onClick={closeSelectionMode}
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>

      <div className="media-grid">
        {visibleAssets.map((asset) => {
          const deletable = isDeletable(asset);
          const isSelected = selectedSet.has(asset.id);

          return (
            <article
              className={`media-tile${selecting ? " is-selecting" : ""}${
                isSelected ? " is-selected" : ""
              }`}
              key={asset.id}
            >
              <Artwork image={asset} />

              {selecting &&
                (deletable ? (
                  <button
                    type="button"
                    className="media-select-surface"
                    aria-label={`${isSelected ? "Deselect" : "Select"} ${asset.fileName}`}
                    aria-pressed={isSelected}
                    onClick={() => toggleSelection(asset.id)}
                  >
                    <span className="media-selection-mark" aria-hidden="true">
                      {isSelected ? "✓" : ""}
                    </span>
                  </button>
                ) : (
                  <span className="media-in-use">In use</span>
                ))}

              <div className="m-meta">
                {asset.fileName}
                <br />
                {(asset.fileSize / 1024 / 1024).toFixed(2)} MB
              </div>

              <div className="m-actions">
                <button type="button" onClick={() => setEditing(asset)}>
                  Details
                </button>
                <button type="button" onClick={() => setReplacement(asset)}>
                  Replace
                </button>
                <button
                  type="button"
                  disabled={pending || !deletable}
                  onClick={() => setDeleting(asset)}
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}

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
                {editing.usage.map((project) => (
                  <li key={project.id}>
                    <Link href={"/admin/projects/" + project.id}>
                      {project.title}
                    </Link>
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

      {deleting && (
        <ConfirmDialog
          title="Delete image?"
          description={
            <>
              <p>
                “{deleting.fileName}” will be permanently removed from the
                media library and storage.
              </p>
              <p className="field-note">
                Referenced images cannot be deleted. This action cannot be
                undone.
              </p>
            </>
          }
          confirmLabel="Delete image"
          pending={pending}
          onClose={() => setDeleting(null)}
          onConfirm={() => deleteOne(deleting)}
        />
      )}

      {bulkConfirm && selected.length > 0 && (
        <ConfirmDialog
          title={`Delete ${selected.length} images?`}
          description={
            <>
              <p>
                The selected unused images will be permanently removed from the
                media library and storage.
              </p>
              <p className="field-note">
                Images referenced by projects or Settings are never selectable.
                This action cannot be undone.
              </p>
            </>
          }
          confirmLabel={`Delete ${selected.length} images`}
          pending={pending}
          onClose={() => setBulkConfirm(false)}
          onConfirm={deleteSelected}
        />
      )}
    </>
  );
}
