"use client";

import { IconPlus } from "@/components/icons";

interface Props {
  title: string;
  meta?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function PageHeader({
  title,
  meta,
  actionLabel,
  onAction,
}: Props) {
  return (
    <div className="hidden flex-wrap items-center justify-between gap-x-4 gap-y-2 lg:flex">
      <h1 className="font-display text-xl font-semibold tracking-tight text-text-hi">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        {meta && <span className="font-mono text-xs text-text-lo">{meta}</span>}
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="flex h-[34px] items-center gap-1.5 rounded-[10px] bg-accent px-3.5 text-[12.5px] font-semibold text-bg transition-opacity hover:opacity-90"
          >
            <IconPlus size={15} />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
