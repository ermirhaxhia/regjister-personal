"use client";

import type { DashboardDay } from "@/lib/api";
import { formatALL } from "@/lib/money";

interface Props {
  daily: DashboardDay[];
  meanExpense: string;
  height?: number;
}

export default function DeviationChart({
  daily,
  meanExpense,
  height = 160,
}: Props) {
  const W = 1180;
  const H = height;
  const pad = 10;

  const mean = Number(meanExpense) || 0;
  const values = daily.map((d) => Number(d.expense) || 0);
  const max = Math.max(...values, mean, 1);
  const min = 0;
  const span = max - min || 1;

  const yOf = (v: number) => pad + (1 - (v - min) / span) * (H - pad * 2);
  const step = daily.length > 1 ? W / (daily.length - 1) : 0;
  const meanY = yOf(mean);

  const maxDelta = Math.max(...values.map((v) => Math.abs(v - mean)), 1);

  return (
    <div>
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="block"
      >
        <line
          x1={0}
          y1={meanY}
          x2={W}
          y2={meanY}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={1.5}
          strokeDasharray="6 5"
          vectorEffect="non-scaling-stroke"
        />
        {daily.map((d, i) => {
          const v = values[i];
          const x = daily.length > 1 ? i * step : W / 2;
          const y = yOf(v);
          const delta = v - mean;
          const intensity = Math.min(Math.abs(delta) / maxDelta, 1);
          const isAbove = delta > 0;
          const fill = isAbove
            ? `rgba(255,122,60,${0.35 + intensity * 0.65})`
            : "rgba(255,255,255,0.3)";
          const r = 3 + intensity * 2.5;
          return (
            <circle
              key={d.date}
              cx={x}
              cy={y}
              r={r}
              fill={fill}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <p className="mt-2 text-[11px] text-text-lo">
        Mesatarja: {formatALL(mean)}/ditë
      </p>
    </div>
  );
}
