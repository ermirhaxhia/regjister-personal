"use client";

import { cn } from "@/lib/cn";
import { IconAlert } from "@/components/icons";

export function LoadingBlock({
  className,
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-2xl border border-border bg-surface"
        />
      ))}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-10 text-center">
      <span className="text-danger">
        <IconAlert size={22} />
      </span>
      <p className="max-w-xs text-sm text-text-mid">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-border px-4 py-2 text-xs text-text-mid transition-colors hover:border-accent/50 hover:text-text-hi"
        >
          Riprovo
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-12 text-center">
      <p className="font-display text-sm text-text-hi">{title}</p>
      {hint && <p className="max-w-xs text-xs text-text-lo">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
