"use client";

import { fullDate, durationLabel } from "@/lib/date";
import { IconTrash } from "@/components/icons";
import type { CollectionEntry } from "@/lib/api";

interface Props {
  items: CollectionEntry[];
  unitLabel: string;
  onDelete: (e: CollectionEntry) => void;
}

export default function EntryList({ items, unitLabel, onDelete }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5"
        >
          <div className="min-w-0 flex-1">
            <div className="font-display text-[13px] font-medium text-text-hi">
              {fullDate(entry.entry_date)}
            </div>
            <div className="mt-0.5 font-mono text-[11px] text-text-lo">
              {entry.amount} {unitLabel}
              {entry.minutes != null ? ` · ${durationLabel(entry.minutes)}` : ""}
              {entry.note ? ` · ${entry.note}` : ""}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onDelete(entry)}
            aria-label="Fshi hyrjen"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-danger"
          >
            <IconTrash size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
