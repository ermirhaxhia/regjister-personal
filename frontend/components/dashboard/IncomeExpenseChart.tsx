"use client";

import { useId } from "react";
import type { DashboardDay } from "@/lib/api";
import { dayMonthShort } from "@/lib/date";

interface Props {
  daily: DashboardDay[];
  height?: number;
}

export default function IncomeExpenseChart({ daily, height = 160 }: Props) {
  const gradId = useId();
  const W = 1180;
  const H = height;
  const pad = 6;

  if (daily.length < 2) {
    return <div style={{ height: H }} />;
  }

  const expenses = daily.map((d) => Number(d.expense) || 0);
  const incomes = daily.map((d) => Number(d.income) || 0);
  const max = Math.max(...expenses, ...incomes, 1);
  const min = 0;
  const span = max - min || 1;

  const step = W / (daily.length - 1);
  const yOf = (v: number) => pad + (1 - (v - min) / span) * (H - pad * 2);
  const fmt = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;

  const expCoords = expenses.map((v, i) => [i * step, yOf(v)] as const);
  const incCoords = incomes.map((v, i) => [i * step, yOf(v)] as const);

  const expLine = expCoords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${fmt(x, y)}`)
    .join(" ");
  const [lastX, lastY] = expCoords[expCoords.length - 1];
  const expArea = `${expLine} L${fmt(lastX, H)} L${fmt(0, H)} Z`;

  const incLine = incCoords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${fmt(x, y)}`)
    .join(" ");

  const first = daily[0].date;
  const last = daily[daily.length - 1].date;

  return (
    <div>
      <div className="mb-2 flex items-center gap-4 text-[11px] text-text-mid">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Shpenzime
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent-2" />
          Të ardhura
        </span>
      </div>
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="block"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FF7A3C" stopOpacity="0.28" />
            <stop offset="1" stopColor="#FF7A3C" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={expArea} fill={`url(#${gradId})`} />
        <path
          d={expLine}
          fill="none"
          stroke="#FF7A3C"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={incLine}
          fill="none"
          stroke="#8b7bff"
          strokeWidth={2.5}
          strokeDasharray="5 5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-0.5 flex justify-between font-mono text-[9.5px] text-text-lo">
        <span>{dayMonthShort(first)}</span>
        <span>{dayMonthShort(last)}</span>
      </div>
    </div>
  );
}
