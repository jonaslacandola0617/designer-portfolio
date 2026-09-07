"use client";

import type { ReactNode } from "react";
import { Dialog } from "./dialog";

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  pending = false,
  onConfirm,
  onClose,
}: {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      title={title}
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <div className="confirm-dialog-body">
        <span className="eyebrow">Permanent action</span>
        <div className="confirm-dialog-copy">{description}</div>
        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="btn ghost"
            disabled={pending}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn confirm-danger"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
