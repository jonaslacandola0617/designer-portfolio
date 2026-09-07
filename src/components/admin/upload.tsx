"use client";
import { useState } from "react";
import type { MediaAsset } from "@prisma/client";
import { requestUpload, completeUpload } from "@/features/media/actions";
export async function uploadFile(file:File){const signed=await requestUpload({fileName:file.name,mimeType:file.type,fileSize:file.size});const response=await fetch(signed.url,{method:"PUT",headers:{"Content-Type":file.type},body:file});if(!response.ok)throw new Error("Upload failed.");return completeUpload(signed.id,"")}
export function Upload({
  onUploaded,
}: {
  onUploaded: (asset: MediaAsset) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <div className="stack">
      <label>
        Upload images (JPEG, PNG, WebP or AVIF, up to 20 MB)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          disabled={busy}
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            setBusy(true);
            setMessage("");
            try {
              for (const file of files) {
                setMessage(`Uploading ${file.name}…`);
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
                if (!response.ok)
                  throw new Error(
                    "Upload failed. Check the storage CORS configuration and try again.",
                  );
                onUploaded(await completeUpload(signed.id, ""));
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
          }}
        />
      </label>
      <p role="status" className="muted">
        {message}
      </p>
    </div>
  );
}
