"use client";
import { useState, useTransition } from "react";
import { retryStorageDeletions } from "@/features/media/actions";
export function StorageCleanup({ count }: { count: number }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  if (!count) return null;
  return (
    <div className="notice">
      <p>{count} deleted image(s) are awaiting removal from object storage.</p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            try {
              await retryStorageDeletions();
              setMessage(
                "Cleanup attempted. Any remaining items will stay queued for retry.",
              );
            } catch {
              setMessage("Could not retry cleanup. Check your session.");
            }
          })
        }
      >
        Retry storage cleanup
      </button>
      <p role="status">{message}</p>
    </div>
  );
}
