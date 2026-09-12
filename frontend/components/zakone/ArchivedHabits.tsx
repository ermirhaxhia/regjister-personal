"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { IconChevronRight, IconTrash } from "@/components/icons";
import type { Habit } from "@/lib/api";

interface Props {
  items: Habit[];
  onReactivate: (h: Habit) => void;
  onDelete: (h: Habit) => void;
}

export default function ArchivedHabits({
  items,
  onReactivate,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-sm text-text-mid transition-colors hover:text-text-hi"
      >
        <span>Arkivuar ({items.length})</span>
        <span
          className={cn(
            "flex transition-transform",
            open && "rotate-90",
          )}
        >
          <IconChevronRight size={15} />
        </span>
      </button>

      {open && (
        <ul className="flex flex-col divide-y divide-border border-t border-border">
          {items.map((h) => (
            <li
              key={h.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-text-hi">{h.name}</div>
                <div className="font-mono text-[10px] uppercase tracking-wide text-text-lo">
                  {h.tracking_type === "binary" ? "binar" : "minuta"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onReactivate(h)}
                className="rounded-md border border-border px-2.5 py-1 text-[11px] text-text-mid transition-colors hover:border-accent-2/50 hover:text-text-hi"
              >
                Ri-aktivizo
              </button>
              <button
                type="button"
                onClick={() => onDelete(h)}
                aria-label="Fshi"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-danger"
              >
                <IconTrash size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
