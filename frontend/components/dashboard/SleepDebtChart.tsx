"use client";

import { useId, useRef, useState } from "react";
import type { SleepInsightsRead, SleepNightPoint } from "@/lib/api";
import { dayMonthShort } from "@/lib/date";

interface Props {
  data: SleepInsightsRead;
  height?: number;
}

function fmtHours(h: number): string {
  const sign = h > 0 ? "+" : h < 0 ? "−" : "";
  return `${sign}${Math.abs(h).toFixed(1)} orë`;
}

export default function SleepDebtChart({ data, height = 160 }: Props) {
  const gradId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const nights = data.nights;

  if (nights.length === 0) {
    return (
      <p className="py-8 text-center text-[13px] text-text-lo">
        Ende pa net të mjaftueshme
      </p>
    );
  }

  const W = 1180;
  const H = height;
  const pad = 10;

  const values = nights.map((n) => n.cumulative_debt_hours);
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const span = max - min || 1;

  const yOf = (v: number) => pad + (1 - (v - min) / span) * (H - pad * 2);
  const step = nights.length > 1 ? W / (nights.length - 1) : 0;
  const zeroY = yOf(0);

  const fmt = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;
  const coords = nights.map((n, i) => {
    const x = nights.length > 1 ? i * step : W / 2;
    return [x, yOf(n.cumulative_debt_hours)] as const;
  });

  const line = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${fmt(x, y)}`)
    .join(" ");
  const lastX = coords.length ? coords[coords.length - 1][0] : 0;
  const area = coords.length
    ? `${line} L${fmt(lastX, zeroY)} L${fmt(0, zeroY)} Z`
    : "";

  const updateHoverFromClientX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg || nights.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * W;
    const idx = nights.length > 1 ? Math.round(svgX / step) : 0;
    setHoverIdx(Math.min(Math.max(idx, 0), nights.length - 1));
  };

  let hover: { x: number; y: number; night: SleepNightPoint } | null = null;
  if (hoverIdx !== null && coords[hoverIdx]) {
    const [x, y] = coords[hoverIdx];
    hover = { x, y, night: nights[hoverIdx] };
  }

  const lastValue = values[values.length - 1];

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
            <stop offset="0" stopColor="#8b7bff" stopOpacity="0.3" />
            <stop offset="1" stopColor="#8b7bff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1={0}
          y1={zeroY}
          x2={W}
          y2={zeroY}
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
              stroke="#8b7bff"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {coords.map(([x, y], i) => (
              <circle
                key={nights[i].night_date}
                cx={x}
                cy={y}
                r={2.5}
                fill="#8b7bff"
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
              fill="#8b7bff"
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
          {dayMonthShort(hover.night.night_date)}{" "}
          <span className="font-mono">
            {fmtHours(hover.night.cumulative_debt_hours)}
          </span>
        </div>
      )}
      <p className="mt-2 text-[11px] text-text-lo">
        Borxhi aktual: <span className="font-mono">{fmtHours(lastValue)}</span>
      </p>
    </div>
  );
}
