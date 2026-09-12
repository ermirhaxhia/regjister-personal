"use client";

import { cn } from "@/lib/cn";

export const inputClass =
  "w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-hi outline-none transition-colors placeholder:text-text-lo focus:border-accent/60";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  const labelClass =
    "text-[11px] font-semibold uppercase tracking-[0.1em] text-text-lo";
  return htmlFor ? (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {error ? (
        <span className="text-[11px] text-danger">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-text-lo">{hint}</span>
      ) : null}
    </div>
  ) : (
    <label className="flex flex-col gap-1.5">
      <span className={labelClass}>{label}</span>
      {children}
      {error ? (
        <span className="text-[11px] text-danger">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-text-lo">{hint}</span>
      ) : null}
    </label>
  );
}

export function SubmitRow({
  busy,
  submitLabel,
  onCancel,
  error,
  disabled = false,
}: {
  busy: boolean;
  submitLabel: string;
  onCancel: () => void;
  error?: string | null;
  disabled?: boolean;
}) {
  return (
    <div className="mt-2 flex flex-col gap-2">
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-lg border border-border px-4 py-2 text-sm text-text-mid transition-colors hover:text-text-hi disabled:opacity-50"
        >
          Anulo
        </button>
        <button
          type="submit"
          disabled={busy || disabled}
          className={cn(
            "rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50",
          )}
        >
          {busy ? "Duke ruajtur…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
