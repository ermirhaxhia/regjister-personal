"use client";

import { durationLabel, timeLabel, dayMonth, fullDate } from "@/lib/date";
import { IconPencil, IconTrash, IconBriefcase } from "@/components/icons";
import type { WorkSession } from "@/lib/api";

interface Props {
  items: WorkSession[];
  onEdit: (s: WorkSession) => void;
  onDelete: (s: WorkSession) => void;
}

export default function WorkSessionList({ items, onEdit, onDelete }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((s) => {
        const start = new Date(s.start_ts);
        const end = new Date(s.end_ts);
        const crosses = start.toDateString() !== end.toDateString();
        return (
          <div
            key={s.id}
            className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-accent">
              <IconBriefcase size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-semibold text-text-hi">
                {fullDate(s.work_date)}
                {s.workplace_name ? ` · ${s.workplace_name}` : ""}
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
