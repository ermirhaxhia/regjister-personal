"use client";

import { useCallback, useMemo, useState } from "react";
import { listClassSessions, type ClassSession } from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { LoadingBlock, ErrorState } from "@/components/common/States";
import { WEEKDAY_LABELS, timeShort, groupByWeekday } from "@/lib/weekday";

export default function WeekScheduleGrid() {
  const [items, setItems] = useState<ClassSession[]>([]);

  const fetchAll = useCallback(() => listClassSessions(true), []);
  const applyAll = useCallback((data: ClassSession[]) => setItems(data), []);
  const { status, reload } = useGenLoad(fetchAll, applyAll);

  const grouped = useMemo(
    () => groupByWeekday(items, (s) => s.weekday, (s) => s.start_time),
    [items],
  );

  if (status === "loading") return <LoadingBlock lines={2} />;
  if (status === "error") {
    return <ErrorState message="Orari nuk u ngarkua." onRetry={reload} />;
  }

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-10 text-center text-xs text-text-lo">
        Ende pa orar. Shtoje te Cilësime → Orari i Shkollës.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
      {WEEKDAY_LABELS.map((label, weekday) => {
        const rows = grouped.get(weekday) ?? [];
        return (
          <div
            key={weekday}
            className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3"
          >
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-lo">
              {label}
            </h3>
            {rows.length === 0 ? (
              <p className="text-[11px] text-text-lo/60">—</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {rows.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-lg border border-border bg-surface-2/40 px-2 py-1.5"
                  >
                    <p className="truncate text-[12px] text-text-hi">
                      {s.subject_name}
                    </p>
                    <p className="font-mono text-[10.5px] text-accent">
                      {timeShort(s.start_time)}–{timeShort(s.end_time)}
                    </p>
                    {s.room && (
                      <p className="truncate text-[10.5px] text-text-lo">
                        {s.room}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
