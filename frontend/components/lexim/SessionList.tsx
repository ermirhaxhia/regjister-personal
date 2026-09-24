"use client";

import { fullDate, durationLabel } from "@/lib/date";
import { IconTrash } from "@/components/icons";
import type { ReadingSession } from "@/lib/api";

interface Props {
  items: ReadingSession[];
  onDelete: (s: ReadingSession) => void;
}

export default function SessionList({ items, onDelete }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5"
        >
          <div className="min-w-0 flex-1">
            <div className="font-display text-[13px] font-medium text-text-hi">
              {fullDate(s.session_date)}
            </div>
            <div className="mt-0.5 font-mono text-[11px] text-text-lo">
              {s.pages_read} faqe
              {s.minutes != null ? ` · ${durationLabel(s.minutes)}` : ""}
              {s.note ? ` · ${s.note}` : ""}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onDelete(s)}
            aria-label="Fshi sesionin"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-danger"
          >
            <IconTrash size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
