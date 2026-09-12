"use client";

import { useId, useRef, useState } from "react";
import type { SummarySeriesPoint, SummaryForecastPoint } from "@/lib/api";
import { formatALL } from "@/lib/money";
import { dayMonthShort } from "@/lib/date";

interface Props {
  points: SummarySeriesPoint[];
  forecast?: SummaryForecastPoint[];
  height?: number;
}

export default function Sparkline({
  points,
  forecast = [],
  height = 60,
}: Props) {
  const gradId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const W = 1180;
  const H = height;

  if (points.length < 2) {
    return <div style={{ height: H }} />;
  }

  const hasForecast = forecast.length > 0;
  const pad = 6;

  const realValues = points.map((p) => p.amount);
  const max = Math.max(
    ...realValues,
    ...(hasForecast ? forecast.map((f) => f.hi) : []),
    1,
  );
  const min = Math.min(
    ...realValues,
    ...(hasForecast ? forecast.map((f) => f.lo) : []),
    0,
  );
  const span = max - min || 1;
  const totalPoints = points.length + forecast.length;
  const step = W / (totalPoints - 1);

  const yOf = (v: number) => pad + (1 - (v - min) / span) * (H - pad * 2);
  const fmt = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;

  const realCoords = points.map((p, i) => [i * step, yOf(p.amount)] as const);
  const [lastX, lastY] = realCoords[realCoords.length - 1];

  const line = realCoords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${fmt(x, y)}`)
    .join(" ");
  const area = `${line} L${fmt(lastX, H)} L${fmt(0, H)} Z`;

  const fcX = forecast.map((_, j) => (points.length + j) * step);

  const fcLine = hasForecast
    ? `M${fmt(lastX, lastY)} ` +
      forecast.map((f, j) => `L${fmt(fcX[j], yOf(f.yhat))}`).join(" ")
    : "";

  const band = hasForecast
    ? `M${fmt(lastX, lastY)} ` +
      forecast.map((f, j) => `L${fmt(fcX[j], yOf(f.hi))}`).join(" ") +
      " " +
      forecast
        .map((f, j) => ({ x: fcX[j], y: yOf(f.lo) }))
        .reverse()
        .map(({ x, y }) => `L${fmt(x, y)}`)
        .join(" ") +
      ` L${fmt(lastX, lastY)} Z`
    : "";

  const updateHoverFromClientX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * W;
    const idx = Math.round(svgX / step);
    setHoverIdx(Math.min(Math.max(idx, 0), totalPoints - 1));
  };

  let hover: { x: number; y: number; date: string; label: string; isForecast: boolean } | null = null;
  if (hoverIdx !== null) {
    if (hoverIdx < points.length) {
      const [x, y] = realCoords[hoverIdx];
      hover = {
        x,
        y,
        date: points[hoverIdx].date,
        label: formatALL(points[hoverIdx].amount),
        isForecast: false,
      };
    } else {
      const j = hoverIdx - points.length;
      const f = forecast[j];
      hover = {
        x: fcX[j],
        y: yOf(f.yhat),
        date: f.date,
        label: `≈ ${formatALL(f.yhat)} · parashikim`,
        isForecast: true,
      };
    }
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="mt-2.5 block cursor-crosshair"
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
        <path d={area} fill={`url(#${gradId})`} />
        {hasForecast && (
          <path d={band} fill="#FF7A3C" fillOpacity={0.12} stroke="none" />
        )}
        <path
          d={line}
          fill="none"
          stroke="#FF7A3C"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="rp-spark"
          vectorEffect="non-scaling-stroke"
        />
        {hasForecast && (
          <path
            d={fcLine}
            fill="none"
            stroke="#FF7A3C"
            strokeOpacity={0.7}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
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
              fillOpacity={hover.isForecast ? 0.7 : 1}
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
          <span className="font-mono">{hover.label}</span>
        </div>
      )}
    </div>
  );
}
