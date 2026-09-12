"use client";

import { durationLabel, timeLabel, dayMonth, fullDate } from "@/lib/date";
import { IconPencil, IconTrash, IconMoon } from "@/components/icons";
import type { Sleep } from "@/lib/api";

interface Props {
  items: Sleep[];
  onEdit: (s: Sleep) => void;
  onDelete: (s: Sleep) => void;
}

export default function SleepList({ items, onEdit, onDelete }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((s) => {
        const start = new Date(s.sleep_start);
        const end = new Date(s.sleep_end);
        const crosses = start.toDateString() !== end.toDateString();
        return (
          <div
            key={s.id}
            className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-accent-2">
              <IconMoon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-semibold text-text-hi">
                {fullDate(s.night_date)}
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-text-lo">
                {timeLabel(start)}
                {crosses ? ` (${dayMonth(start)})` : ""} → {timeLabel(end)}
                {crosses ? ` (${dayMonth(end)})` : ""}
                {s.note ? ` · ${s.note}` : ""}
              </div>
            </div>
            <span className="shrink-0 font-mono text-sm font-semibold text-text-hi">
              {durationLabel(s.duration_minutes)}
            </span>
            <span className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => onEdit(s)}
                aria-label="Redakto"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-text-hi"
              >
                <IconPencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(s)}
                aria-label="Fshi"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-danger"
              >
                <IconTrash size={14} />
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
}
