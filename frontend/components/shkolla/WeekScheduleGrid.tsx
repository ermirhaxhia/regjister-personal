"use client";

import { useCallback, useMemo, useState } from "react";
import { listClassSessions, type ClassSession } from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/common/States";
import { WEEKDAY_LABELS, groupByWeekday } from "@/lib/weekday";
import { colorForSubject, timeToMinutes } from "./scheduleColors";
import ScheduleBlock from "./ScheduleBlock";

const ROW_HEIGHT_PX = 56;

export default function WeekScheduleGrid() {
  const [items, setItems] = useState<ClassSession[]>([]);

  const fetchAll = useCallback(() => listClassSessions(true), []);
  const applyAll = useCallback((data: ClassSession[]) => setItems(data), []);
  const { status, reload } = useGenLoad(fetchAll, applyAll);

  const grouped = useMemo(
    () => groupByWeekday(items, (s) => s.weekday, (s) => s.start_time),
    [items],
  );

  const activeDays = useMemo(
    () =>
      WEEKDAY_LABELS.map((label, weekday) => ({ label, weekday }))
        .filter(({ weekday }) => (grouped.get(weekday) ?? []).length > 0),
    [grouped],
  );

  const { rangeStartMinutes, totalMinutes, hours } = useMemo(() => {
    if (items.length === 0) {
      return { rangeStartMinutes: 0, totalMinutes: 0, hours: [] as number[] };
    }
    let minStart = Infinity;
    let maxEnd = -Infinity;
    for (const s of items) {
      const start = timeToMinutes(s.start_time);
      const end = timeToMinutes(s.end_time);
      if (start < minStart) minStart = start;
      if (end > maxEnd) maxEnd = end;
    }
    const startHour = Math.floor(minStart / 60);
    const endHour = Math.ceil(maxEnd / 60);
    const hourList: number[] = [];
    for (let h = startHour; h < endHour; h++) hourList.push(h);
    return {
      rangeStartMinutes: startHour * 60,
      totalMinutes: (endHour - startHour) * 60,
      hours: hourList,
    };
  }, [items]);

  const subjects = useMemo(() => {
    const seen = new Map<string, string>();
    for (const s of items) {
      if (!seen.has(s.subject_name)) {
        seen.set(s.subject_name, colorForSubject(s.subject_name));
      }
    }
    return Array.from(seen.entries());
  }, [items]);

  if (status === "loading") return <LoadingBlock lines={2} />;
  if (status === "error") {
    return <ErrorState message="Orari nuk u ngarkua." onRetry={reload} />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Ende pa orar"
        hint="Shtoje orarin te Cilësime → Orari i Shkollës që të shfaqet tabela javore."
      />
    );
  }

  const columnHeight = hours.length * ROW_HEIGHT_PX;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <div
          className="grid min-w-[640px]"
          style={{
            gridTemplateColumns: `56px repeat(${activeDays.length}, minmax(120px, 1fr))`,
          }}
        >
          <div className="border-b border-border" />
          {activeDays.map(({ label, weekday }) => (
            <div
              key={weekday}
              className="border-b border-l border-border px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-text-lo"
            >
              {label}
            </div>
          ))}

          <div className="relative" style={{ height: columnHeight }}>
            {hours.map((h) => (
              <div
                key={h}
                className="absolute inset-x-0 flex items-start justify-end border-t border-border/60 pr-1.5 pt-0.5 text-[10px] text-text-lo"
                style={{
                  top: ((h - hours[0]) / hours.length) * 100 + "%",
                  height: (1 / hours.length) * 100 + "%",
                }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {activeDays.map(({ weekday }) => {
            const sessions = grouped.get(weekday) ?? [];
            return (
              <div
                key={weekday}
                className="relative border-l border-border"
                style={{ height: columnHeight }}
              >
                {hours.map((h, idx) => (
                  <div
                    key={h}
                    className={`absolute inset-x-0 border-t border-border/60 ${
                      idx % 2 === 1 ? "bg-surface-2/20" : ""
                    }`}
                    style={{
                      top: (idx / hours.length) * 100 + "%",
                      height: (1 / hours.length) * 100 + "%",
                    }}
                  />
                ))}
                {sessions.map((s) => (
                  <ScheduleBlock
                    key={s.id}
                    session={s}
                    rangeStartMinutes={rangeStartMinutes}
                    totalMinutes={totalMinutes}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
        {subjects.map(([name, color]) => (
          <li
            key={name}
            className="flex items-center gap-1.5 text-[11px] text-text-mid"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="truncate">{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
