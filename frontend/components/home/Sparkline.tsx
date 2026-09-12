"use client";

import { useId } from "react";
import type { SummarySeriesPoint, SummaryForecastPoint } from "@/lib/api";

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
  const step = W / (points.length + forecast.length - 1);

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

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="mt-2.5 block"
      aria-hidden="true"
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
    </svg>
  );
}
