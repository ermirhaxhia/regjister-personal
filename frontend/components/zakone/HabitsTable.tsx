"use client";

import { cn } from "@/lib/cn";
import {
  upsertHabitLog,
  deleteHabitLog,
  type HabitGridRow,
  type HabitsGrid,
} from "@/lib/api";
import HabitTableRow from "@/components/zakone/HabitTableRow";
import HabitMobileCard from "@/components/zakone/HabitMobileCard";

interface Props {
  grid: HabitsGrid;
  today: string;
  days: 14 | 30;
  onDaysChange: (d: 14 | 30) => void;
  onOptimistic: (
    habitId: string,
    updater: (row: HabitGridRow) => HabitGridRow,
  ) => void;
  onRefresh: () => void;
}

function LegendItem({
  swatch,
  label,
}: {
  swatch: string;
  label: string;
}) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-[3px]", swatch)} />
      {label}
    </li>
  );
}

function HabitLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-text-lo">
      <LegendItem swatch="bg-accent-2" label="mbajtur" />
      <LegendItem swatch="border border-white/25" label="pa shënim" />
      <LegendItem swatch="border border-accent" label="sot" />
    </ul>
  );
}

export function recomputeRow(row: HabitGridRow): HabitGridRow {
  let streak = 0;
  for (let i = row.cells.length - 1; i >= 0; i -= 1) {
    if (row.cells[i].met) streak += 1;
    else break;
  }
  const hit = row.cells.filter((c) => c.met).length;
  const rate_pct = row.cells.length
    ? Math.round((hit / row.cells.length) * 100)
    : 0;
  return { ...row, streak_current: streak, rate_pct };
}

export default function HabitsTable({
  grid,
  today,
  days,
  onDaysChange,
  onOptimistic,
  onRefresh,
}: Props) {
  const setLastCell = (
    row: HabitGridRow,
    patch: Partial<HabitGridRow["cells"][number]>,
  ): HabitGridRow => {
    const cells = row.cells.slice();
    const last = cells.length - 1;
    cells[last] = { ...cells[last], ...patch };
    return recomputeRow({ ...row, cells });
  };

  const toggleBinary = async (row: HabitGridRow) => {
    const last = row.cells[row.cells.length - 1];
    const nextMet = !last.met;
    onOptimistic(row.id, (r) =>
      setLastCell(r, { done: nextMet ? true : null, met: nextMet }),
    );
    try {
      if (nextMet) await upsertHabitLog(row.id, today, { done: true });
      else await deleteHabitLog(row.id, today);
    } finally {
      onRefresh();
    }
  };

  const commitDuration = async (row: HabitGridRow, value: number) => {
    const n = Math.max(0, Math.round(value || 0));
    const prev = row.cells[row.cells.length - 1].duration_minutes ?? 0;
    if (n === prev) return;
    onOptimistic(row.id, (r) =>
      setLastCell(r, { duration_minutes: n > 0 ? n : null, met: n > 0 }),
    );
    try {
      if (n > 0) await upsertHabitLog(row.id, today, { duration_minutes: n });
      else await deleteHabitLog(row.id, today);
    } finally {
      onRefresh();
    }
  };

  const rows = grid.habits;

  return (
    <section className="flex w-full flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <HabitLegend />
        </div>
        <div className="flex shrink-0 overflow-hidden rounded-lg border border-border font-mono text-[11px]">
          {([14, 30] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onDaysChange(n)}
              aria-pressed={days === n}
              className={cn(
                "px-2.5 py-1 transition-colors",
                days === n
                  ? "bg-accent-2/20 text-text-hi"
                  : "text-text-lo hover:text-text-mid",
              )}
            >
              {n} ditë
            </button>
          ))}
        </div>
      </div>

      <div className="hidden w-full rounded-2xl border border-border bg-surface md:block">
        <div className="max-h-[72vh] overflow-y-auto overflow-x-hidden rounded-2xl">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col style={{ width: "240px" }} />
              <col style={{ width: "130px" }} />
              <col style={{ width: "110px" }} />
              <col style={{ width: "130px" }} />
              <col />
            </colgroup>
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-wide text-text-lo">
                <th className="sticky top-0 z-10 border-b-2 border-border bg-surface px-4 py-3 font-normal">
                  Zakoni
                </th>
                <th className="sticky top-0 z-10 border-b-2 border-border bg-surface px-2 py-3 text-center font-normal">
                  Sot
                </th>
                <th className="sticky top-0 z-10 border-b-2 border-border bg-surface px-3 py-3 font-normal">
                  Seria
                </th>
                <th className="sticky top-0 z-10 border-b-2 border-border bg-surface px-3 py-3 font-normal">
                  Mbajtur
                </th>
                <th className="sticky top-0 z-10 border-b-2 border-border bg-surface px-3 py-3 font-normal">
                  Historiku
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <HabitTableRow
                  key={row.id}
                  row={row}
                  today={today}
                  days={days}
                  onToggle={() => toggleBinary(row)}
                  onCommitDuration={(v) => commitDuration(row, v)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <HabitMobileCard
            key={row.id}
            row={row}
            today={today}
            days={days}
            onToggle={() => toggleBinary(row)}
            onCommitDuration={(v) => commitDuration(row, v)}
          />
        ))}
      </div>
    </section>
  );
}
