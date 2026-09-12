"use client";

import { useState } from "react";
import Sheet from "@/components/common/Sheet";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export default function Confirm({
  open,
  title,
  message,
  confirmLabel = "Fshi",
  onConfirm,
  onCancel,
}: Props) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-text-mid">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-lg border border-border px-4 py-2 text-sm text-text-mid transition-colors hover:text-text-hi disabled:opacity-50"
        >
          Anulo
        </button>
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Duke fshirë…" : confirmLabel}
        </button>
      </div>
    </Sheet>
  );
}
