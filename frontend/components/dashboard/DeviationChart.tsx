"use client";

import { useId, useRef, useState } from "react";
import type { DashboardDay } from "@/lib/api";
import { formatALL } from "@/lib/money";
import { dayMonthShort } from "@/lib/date";

interface Props {
  daily: DashboardDay[];
  meanExpense: string;
  height?: number;
}

function median(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export default function DeviationChart({
  daily,
  meanExpense,
  height = 160,
}: Props) {
  const gradId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const W = 1180;
  const H = height;
  const pad = 10;

  const mean = Number(meanExpense) || 0;
  const values = daily.map((d) => Number(d.expense) || 0);

  const med = median(values);
  const mad = median(values.map((v) => Math.abs(v - med)));
  // 1.4826 e afron MAD me shkallën e std nën shpërndarje normale — konvencion standard
  const robustLevel = med + 1.4826 * mad;

  const max = Math.max(...values, mean, robustLevel, 1);
  const min = 0;
  const span = max - min || 1;

  const yOf = (v: number) => pad + (1 - (v - min) / span) * (H - pad * 2);
  const step = daily.length > 1 ? W / (daily.length - 1) : 0;
  const meanY = yOf(mean);
  const robustY = yOf(robustLevel);

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

  const updateHoverFromClientX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg || daily.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * W;
    const idx = daily.length > 1 ? Math.round(svgX / step) : 0;
    setHoverIdx(Math.min(Math.max(idx, 0), daily.length - 1));
  };

  let hover: { x: number; y: number; date: string; value: number } | null =
    null;
  if (hoverIdx !== null && coords[hoverIdx]) {
    const [x, y] = coords[hoverIdx];
    hover = { x, y, date: daily[hoverIdx].date, value: values[hoverIdx] };
  }

  const diff = hover ? hover.value - mean : 0;
  const sign = diff > 0 ? "+" : diff < 0 ? "−" : "";

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="block cursor-crosshair"
        onMouseMove={(e) => updateHoverFromClientX(e.clientX)}
        onMouseLeave={() => setHoverIdx(null)}
        onTouchStart={(e) => updateHoverFromClientX(e.touches[0].clientX)}
        onTouchMove={(e) => updateHoverFromClientX(e.touches[0].clientX)}
        onTouchEnd={() => setHoverIdx(null)}
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
        <line
          x1={0}
          y1={robustY}
          x2={W}
          y2={robustY}
          stroke="rgba(255,122,60,0.35)"
          strokeWidth={1.2}
          strokeDasharray="3 4"
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
        {hover && (
          <>
            <line
              x1={hover.x}
              y1={0}
              x2={hover.x}
              y2={H}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={hover.x}
              cy={hover.y}
              r={4}
              fill="#FF7A3C"
              stroke="#0f0f12"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
      </svg>
      {hover && (
        <div
          className="rp-glass-tooltip pointer-events-none absolute -top-1 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md px-2 py-1 text-[11px] text-text-hi shadow-lg"
          style={{ left: `${(hover.x / W) * 100}%` }}
        >
          {dayMonthShort(hover.date)}{" "}
          <span className="font-mono">{formatALL(hover.value)}</span>{" "}
          <span className="text-text-lo">
            · {sign}
            {formatALL(Math.abs(diff))} nga mesatarja
          </span>
        </div>
      )}
      <p className="mt-2 text-[11px] text-text-lo">
        Mesatarja: {formatALL(mean)}/ditë · Prag i pazakontë: {formatALL(robustLevel)}
      </p>
    </div>
  );
}
