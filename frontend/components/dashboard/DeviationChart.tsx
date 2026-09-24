"use client";

import { useId } from "react";
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
  const gradId = useId();
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

  const fmt = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;
  const coords = daily.map((d, i) => {
    const x = daily.length > 1 ? i * step : W / 2;
    return [x, yOf(values[i])] as const;
  });

  const line = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${fmt(x, y)}`)
    .join(" ");
  const lastX = coords.length ? coords[coords.length - 1][0] : 0;
  const area = coords.length ? `${line} L${fmt(lastX, H)} L${fmt(0, H)} Z` : "";

  return (
    <div>
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="block"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FF7A3C" stopOpacity="0.3" />
            <stop offset="1" stopColor="#FF7A3C" stopOpacity="0" />
          </linearGradient>
        </defs>
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
        {coords.length > 0 && (
          <>
            <path d={area} fill={`url(#${gradId})`} />
            <path
              d={line}
              fill="none"
              stroke="#FF7A3C"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {coords.map(([x, y], i) => (
              <circle
                key={daily[i].date}
                cx={x}
                cy={y}
                r={2.5}
                fill="#FF7A3C"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </>
        )}
      </svg>
      <p className="mt-2 text-[11px] text-text-lo">
        Mesatarja: {formatALL(mean)}/ditë
      </p>
    </div>
  );
}
