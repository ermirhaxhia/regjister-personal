"use client";

import type { ComponentType } from "react";
import { cn } from "@/lib/cn";
import { IconPencil } from "@/components/icons";

interface Props {
  icon: ComponentType<{ size?: number }>;
  name: string;
  description: string;
  active: boolean;
  onModify: () => void;
}

export default function ModuleCard({
  icon: Icon,
  name,
  description,
  active,
  onModify,
}: Props) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-[18px]",
        active
          ? "border-border bg-surface"
          : "border-white/[0.06] bg-[#0f0f12] opacity-70",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border",
            active
              ? "border-accent/35 bg-accent/15 text-accent"
              : "border-white/[0.08] bg-[#17171c] text-text-lo",
          )}
        >
          <Icon size={20} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="font-display text-sm font-semibold text-text-hi">
            {name}
          </h2>
          <p className="text-[11.5px] text-text-lo">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.1em]",
            active ? "text-success" : "text-text-lo",
          )}
        >
          {active ? "aktiv" : "së shpejti"}
        </span>
        <button
          type="button"
          onClick={onModify}
          className={cn(
            "flex items-center gap-1.5 rounded-[9px] border px-3 py-1.5 text-xs font-medium transition-colors",
            active
              ? "border-border bg-surface-2 text-text-hi hover:border-accent/40"
              : "border-white/[0.07] bg-[#161619] text-text-lo hover:text-text-mid",
          )}
        >
          <IconPencil size={13} />
          Modifiko
        </button>
      </div>
    </article>
  );
}
