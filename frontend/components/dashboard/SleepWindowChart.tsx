"use client";

import { useRef, useState } from "react";
import type { SleepInsightsRead, SleepNightPoint } from "@/lib/api";
import { dayMonthShort } from "@/lib/date";

interface Props {
  data: SleepInsightsRead;
  height?: number;
}

const DOMAIN_MIN = 19; // 19:00
const DOMAIN_MAX = 32; // 08:00 e mëngjesit tjetër
const TICKS = [20, 22, 24, 26, 28, 30];

function clockLabel(hour: number): string {
  const h = Math.round(hour) % 24;
  return `${String(h).padStart(2, "0")}:00`;
}

function fmtHour(hour: number): string {
  const h = Math.floor(hour) % 24;
  const m = Math.round((hour - Math.floor(hour)) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function SleepWindowChart({ data, height = 220 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const nights = data.nights;
  const hasBand = data.bedtime_mean != null && data.bedtime_std != null;

  if (nights.length === 0) {
    return (
      <p className="py-8 text-center text-[13px] text-text-lo">
        Ende pa net të mjaftueshme
      </p>
    );
  }

  const W = 1180;
  const H = height;
  const padTop = 10;
  const padBottom = 10;
  const padLeft = 46;

  const span = DOMAIN_MAX - DOMAIN_MIN;
  const yOf = (h: number) =>
    padTop + ((h - DOMAIN_MIN) / span) * (H - padTop - padBottom);

  const innerW = W - padLeft;
  const step = nights.length > 1 ? innerW / (nights.length - 1) : 0;
  const xOf = (i: number) => padLeft + (nights.length > 1 ? i * step : innerW / 2);

  const updateHoverFromClientX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * W;
    const idx =
      nights.length > 1 ? Math.round((svgX - padLeft) / step) : 0;
    setHoverIdx(Math.min(Math.max(idx, 0), nights.length - 1));
  };

  const hover: SleepNightPoint | null =
    hoverIdx !== null ? nights[hoverIdx] : null;

  let bandTopY = 0;
  let bandBottomY = 0;
  let meanY = 0;
  if (hasBand) {
    const mean = data.bedtime_mean as number;
    const std = data.bedtime_std as number;
    bandTopY = yOf(mean - std);
    bandBottomY = yOf(mean + std);
    meanY = yOf(mean);
  }

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
        {TICKS.map((t) => (
          <g key={t}>
            <line
              x1={padLeft}
              y1={yOf(t)}
              x2={W}
              y2={yOf(t)}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={0}
              y={yOf(t) + 3}
              fontSize={10}
              fill="var(--color-text-lo, #8a8a95)"
              className="font-mono"
            >
              {clockLabel(t)}
            </text>
          </g>
        ))}

        {hasBand && (
          <>
            <rect
              x={padLeft}
              y={bandTopY}
              width={innerW}
              height={Math.max(bandBottomY - bandTopY, 0)}
              fill="rgba(139,123,255,0.12)"
            />
            <line
              x1={padLeft}
              y1={meanY}
              x2={W}
              y2={meanY}
              stroke="rgba(139,123,255,0.5)"
              strokeWidth={1.2}
              strokeDasharray="5 4"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}

        {nights.map((n, i) => {
          const x = xOf(i);
          const yBed = yOf(Math.min(Math.max(n.bedtime_hour, DOMAIN_MIN), DOMAIN_MAX));
          const yWake = yOf(
            Math.min(Math.max(n.waketime_hour, DOMAIN_MIN), DOMAIN_MAX),
          );
          const isHover = hoverIdx === i;
          return (
            <g key={n.night_date}>
              <line
                x1={x}
                y1={yBed}
                x2={x}
                y2={yWake}
                stroke="#FF7A3C"
                strokeWidth={isHover ? 4 : 3}
                strokeLinecap="round"
                opacity={isHover ? 1 : 0.75}
                vectorEffect="non-scaling-stroke"
              />
              <circle cx={x} cy={yBed} r={2.5} fill="#FF7A3C" />
              <circle cx={x} cy={yWake} r={2.5} fill="#8b7bff" />
            </g>
          );
        })}

        {hover && (
          <line
            x1={xOf(hoverIdx as number)}
            y1={0}
            x2={xOf(hoverIdx as number)}
            y2={H}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      {hover && (
        <div
          className="rp-glass-tooltip pointer-events-none absolute -top-1 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md px-2 py-1 text-[11px] text-text-hi shadow-lg"
          style={{ left: `${(xOf(hoverIdx as number) / W) * 100}%` }}
        >
          {dayMonthShort(hover.night_date)}{" "}
          <span className="font-mono">
            {fmtHour(hover.bedtime_hour)} → {fmtHour(hover.waketime_hour)}
          </span>{" "}
          <span className="text-text-lo">
            · {Math.round(hover.duration_minutes / 60)}h{" "}
            {Math.round(hover.duration_minutes % 60)}m
          </span>
        </div>
      )}
      <p className="mt-2 text-[11px] text-text-lo">
        {hasBand
          ? "Brezi vjollcë tregon rregullsinë e orës së fjetjes (±1 devijim standard)."
          : "Nevojiten të paktën 2 net për brezin e rregullsisë."}
      </p>
    </div>
  );
}
