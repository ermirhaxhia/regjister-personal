"use client";

import { useMemo, useState } from "react";
import type { ExpenseHeatmapRead, HeatmapDay } from "@/lib/api";
import { formatALL } from "@/lib/money";
import { fullDate, monthShort } from "@/lib/date";

interface Props {
  data: ExpenseHeatmapRead;
}

interface Cell {
  date: string;
  amount: number;
  row: number;
  col: number;
}

const ROW_LABELS = ["Hën", "", "Mër", "", "Prem", "", "Die"];
const LEVEL_OPACITY = [0.06, 0.18, 0.34, 0.5, 0.68, 0.88];

function weekdayIndex(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const jsDay = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Die..6=Sht
  return (jsDay + 6) % 7; // 0=Hën..6=Die
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const idx = (sorted.length - 1) * q;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function buildLevels(days: HeatmapDay[]): (d: number) => number {
  const positive = days
    .map((d) => Number(d.amount))
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  if (positive.length === 0) return () => 0;
  const q20 = quantile(positive, 0.2);
  const q40 = quantile(positive, 0.4);
  const q60 = quantile(positive, 0.6);
  const q80 = quantile(positive, 0.8);
  return (v: number) => {
    if (v <= 0) return 0;
    if (v <= q20) return 1;
    if (v <= q40) return 2;
    if (v <= q60) return 3;
    if (v <= q80) return 4;
    return 5;
  };
}

function cellColor(level: number): string {
  if (level === 0) return "rgba(255,255,255,0.06)";
  return `rgba(255,122,60,${LEVEL_OPACITY[level]})`;
}

export default function ExpenseHeatmap({ data }: Props) {
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    date: string;
    amount: number;
  } | null>(null);

  const { cells, cols, monthTicks } = useMemo(() => {
    const days = data.days;
    if (days.length === 0) {
      return {
        cells: [] as Cell[],
        cols: 0,
        monthTicks: [] as { col: number; label: string }[],
      };
    }
    const firstOffset = weekdayIndex(days[0].date);
    const built: Cell[] = days.map((d, i) => {
      const row = weekdayIndex(d.date);
      const col = Math.floor((i + firstOffset) / 7);
      return { date: d.date, amount: Number(d.amount), row, col };
    });
    const colCount = Math.max(...built.map((c) => c.col)) + 1;
    const ticks: { col: number; label: string }[] = [];
    let lastMonth = "";
    for (const c of built) {
      const m = c.date.slice(0, 7);
      if (m !== lastMonth && c.row === 0) {
        ticks.push({ col: c.col, label: monthShort(c.date) });
        lastMonth = m;
      }
    }
    return { cells: built, cols: colCount, monthTicks: ticks };
  }, [data]);

  const levelOf = useMemo(() => buildLevels(data.days), [data]);

  if (data.days.length === 0) {
    return (
      <p className="py-8 text-center text-[13px] text-text-lo">
        Ende pa shpenzime të regjistruara
      </p>
    );
  }
  const cellSize = 12;
  const gap = 3;

  return (
    <div className="relative overflow-x-auto pb-2">
      <div
        className="relative grid"
        style={{
          gridTemplateColumns: `24px repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `12px repeat(7, ${cellSize}px)`,
          gap: `${gap}px`,
        }}
      >
        <div />
        {Array.from({ length: cols }).map((_, col) => {
          const tick = monthTicks.find((t) => t.col === col);
          return (
            <div
              key={`m-${col}`}
              className="text-[9px] leading-3 text-text-lo"
              style={{ gridColumn: col + 2, gridRow: 1 }}
            >
              {tick ? tick.label : ""}
            </div>
          );
        })}

        {ROW_LABELS.map((label, row) => (
          <div
            key={`r-${row}`}
            className="text-[9px] leading-none text-text-lo"
            style={{ gridColumn: 1, gridRow: row + 2 }}
          >
            {label}
          </div>
        ))}

        {cells.map((c) => (
          <div
            key={c.date}
            role="presentation"
            className="cursor-pointer rounded-[2px]"
            style={{
              gridColumn: c.col + 2,
              gridRow: c.row + 2,
              width: cellSize,
              height: cellSize,
              backgroundColor: cellColor(levelOf(c.amount)),
            }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHover({
                x: rect.left + rect.width / 2,
                y: rect.top,
                date: c.date,
                amount: c.amount,
              });
            }}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </div>

      {hover && (
        <div
          className="rp-glass-tooltip pointer-events-none fixed z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md px-2 py-1 text-[11px] text-text-hi shadow-lg"
          style={{ left: hover.x, top: hover.y - 6 }}
        >
          {fullDate(hover.date)}{" "}
          <span className="font-mono">{formatALL(hover.amount)}</span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-text-lo">
        <span>Më pak</span>
        {LEVEL_OPACITY.map((_, i) => (
          <span
            key={i}
            className="inline-block h-[10px] w-[10px] rounded-[2px]"
            style={{ backgroundColor: cellColor(i) }}
          />
        ))}
        <span>Më shumë</span>
      </div>
    </div>
  );
}
