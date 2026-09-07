"use client";

import { useRef, useState } from "react";
import type { MediaAsset } from "@prisma/client";
import { completeUpload, requestUpload } from "@/features/media/actions";

export async function uploadFile(file: File) {
  const signed = await requestUpload({
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
  });
  const response = await fetch(signed.url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!response.ok) throw new Error("Upload failed.");
  return completeUpload(signed.id, "");
}

export function Upload({
  onUploaded,
}: {
  onUploaded: (asset: MediaAsset) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");

  async function processFiles(files: File[]) {
    if (!files.length || busy) return;

    setBusy(true);
    setMessage("");

    try {
      for (const file of files) {
        setMessage(`Uploading ${file.name}…`);
        const asset = await uploadFile(file);
        onUploaded(asset);
      }

      setMessage(
        `${files.length} image(s) uploaded. Add descriptive alt text before publishing.`,
      );
    } catch {
      setMessage(
        "Upload failed. Check the image format, file size and storage configuration, then try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="upload-panel" aria-label="Upload artwork">
      <div className="upload-panel-head">
        <span className="eyebrow">New upload</span>
        <span className="upload-panel-state">
          {busy ? "Uploading" : "Local files"}
        </span>
      </div>

      <div
        className={`upload-drop${dragging ? " is-dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!busy) void processFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <input
          ref={inputRef}
          className="upload-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          disabled={busy}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            void processFiles(files);
          }}
        />

        <span className="upload-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 17V5" />
            <path d="m7.5 9.5 4.5-4.5 4.5 4.5" />
            <path d="M5 19h14" />
          </svg>
        </span>

        <span className="upload-copy">
          <span className="upload-title">Drop artwork here</span>
          <span className="upload-spec">
            JPEG / PNG / WEBP / AVIF — MAX 20 MB
          </span>
        </span>

        <button
          type="button"
          className="upload-select"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Uploading…" : "Choose files +"}
        </button>
      </div>

      <p role="status" className="upload-status">
        {message || "Files upload directly to secure media storage."}
      </p>
    </section>
  );
}
