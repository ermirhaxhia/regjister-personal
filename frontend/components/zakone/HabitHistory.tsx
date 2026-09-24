"use client";

import { cn } from "@/lib/cn";
import { fullDate, monthShort } from "@/lib/date";
import type { HabitGridCell } from "@/lib/api";

const WEEKDAY_LETTER = ["Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Sht"];

interface Props {
  cells: HabitGridCell[];
  today: string;
  count: 14 | 30;
  fill?: boolean;
}

function cellClass(
  cell: HabitGridCell,
  isToday: boolean,
  fill: boolean,
  dense: boolean,
): string {
  const hasEntry = cell.done !== null || cell.duration_minutes !== null;
  return cn(
    "flex items-center justify-center overflow-hidden rounded-[3px] font-mono leading-none tabular-nums transition-colors",
    !fill && "h-6 text-[9px]",
    fill && (dense ? "h-7 text-[9px]" : "h-8 text-[10px]"),
    cell.met
      ? "bg-accent-2 text-bg"
      : hasEntry
        ? "bg-accent-2/35 text-text-hi"
        : "border border-white/12 text-text-lo",
    isToday && !cell.met && "border border-accent",
    isToday && cell.met && "outline outline-1 outline-offset-1 outline-accent",
  );
}

function cellLabel(date: string, withMonth: boolean): string {
  const d = new Date(date);
  if (withMonth && d.getDate() === 1) return monthShort(date).toUpperCase();
  return String(d.getDate());
}

export default function HabitHistory({ cells, today, count, fill = false }: Props) {
  const dense = count === 30;
  const columns = fill
    ? `repeat(${cells.length}, minmax(0, 1fr))`
    : `repeat(${cells.length}, ${dense ? 19 : 22}px)`;

  const grid = (
    <div
      className={cn("grid", fill ? "gap-1.5" : "gap-1")}
      style={{ gridTemplateColumns: columns }}
    >
      {cells.map((c) => (
        <span
          key={`hd-${c.date}`}
          title={fullDate(c.date)}
          className="mb-1 text-center font-mono text-[9px] leading-none text-text-lo"
        >
          {WEEKDAY_LETTER[new Date(c.date).getDay()]}
        </span>
      ))}
      {cells.map((c) => (
        <span
          key={c.date}
          title={fullDate(c.date)}
          className={cellClass(c, c.date === today, fill, dense)}
        >
          {cellLabel(c.date, fill)}
        </span>
      ))}
    </div>
  );

  if (fill) {
    return <div className="w-full">{grid}</div>;
  }

  return <div className="-mx-1 overflow-x-auto px-1 py-0.5">{grid}</div>;
}
