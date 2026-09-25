"use client";

import { useId, useRef, useState } from "react";
import type { ForecastBacktestRead } from "@/lib/api";
import { formatALL } from "@/lib/money";
import { dayMonthShort } from "@/lib/date";
import { EmptyState } from "@/components/common/States";

interface Props {
  data: ForecastBacktestRead;
  height?: number;
}

export default function ForecastBacktestChart({ data, height = 180 }: Props) {
  const gradId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const { points, coverage_pct, target_coverage_pct, mae_ewma, mae_naive, days_tested } =
    data;

  if (days_tested === 0 || points.length === 0) {
    return (
      <EmptyState
        title="Ende pa mjaftueshëm histori"
        hint="Nevojiten të paktën ~3 javë shpenzimesh të vazhdueshme që të llogaritet saktësia e parashikimit."
      />
    );
  }

  const W = 1180;
  const H = height;
  const pad = 10;

  const values = points.flatMap((p) => [p.actual, p.yhat, p.lo, p.hi]);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;

  const yOf = (v: number) => pad + (1 - (v - min) / span) * (H - pad * 2);
  const step = points.length > 1 ? W / (points.length - 1) : 0;
  const xOf = (i: number) => (points.length > 1 ? i * step : W / 2);

  const fmt = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;

  const yhatLine = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${fmt(xOf(i), yOf(p.yhat))}`)
    .join(" ");
  const loPoints = points.map((p, i) => fmt(xOf(i), yOf(p.lo)));
  const hiPoints = points
    .map((p, i) => fmt(xOf(i), yOf(p.hi)))
    .reverse();
  const band = `M${loPoints.join(" L")} L${hiPoints.join(" L")} Z`;

  const updateHoverFromClientX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg || points.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * W;
    const idx = points.length > 1 ? Math.round(svgX / step) : 0;
    setHoverIdx(Math.min(Math.max(idx, 0), points.length - 1));
  };

  const hover = hoverIdx !== null ? points[hoverIdx] : null;
  const hoverX = hoverIdx !== null ? xOf(hoverIdx) : 0;

  const coverageOff =
    coverage_pct != null && Math.abs(coverage_pct - target_coverage_pct) >= 15;
  const modelBetter =
    mae_ewma != null && mae_naive != null && mae_ewma < mae_naive;

  return (
    <div>
      <div className="mb-3 grid grid-cols-3 gap-3">
        <Stat
          label="Mbulimi"
          value={coverage_pct != null ? `${coverage_pct.toFixed(0)}%` : "—"}
          sub={`synim ${target_coverage_pct.toFixed(0)}%`}
          warn={coverageOff}
        />
        <Stat
          label="MAE modeli"
          value={mae_ewma != null ? formatALL(mae_ewma) : "—"}
          sub={modelBetter ? "më mirë se mesatarja" : undefined}
          good={modelBetter}
        />
        <Stat
          label="MAE naiv"
          value={mae_naive != null ? formatALL(mae_naive) : "—"}
          sub="mesatarja 7-ditore"
        />
      </div>

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
              <stop offset="0" stopColor="#8b7bff" stopOpacity="0.25" />
              <stop offset="1" stopColor="#8b7bff" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d={band} fill={`url(#${gradId})`} />
          <path
            d={yhatLine}
            fill="none"
            stroke="#8b7bff"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="5 4"
            vectorEffect="non-scaling-stroke"
          />
          {points.map((p, i) => (
            <circle
              key={p.date}
              cx={xOf(i)}
              cy={yOf(p.actual)}
              r={3}
              fill={p.in_band ? "#8b7bff" : "#ff5b5b"}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {hover && (
            <>
              <line
                x1={hoverX}
                y1={0}
                x2={hoverX}
                y2={H}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={hoverX}
                cy={yOf(hover.actual)}
                r={4.5}
                fill={hover.in_band ? "#8b7bff" : "#ff5b5b"}
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
            style={{ left: `${(hoverX / W) * 100}%` }}
          >
            {dayMonthShort(hover.date)}{" "}
            <span className="font-mono">{formatALL(hover.actual)}</span>{" "}
            <span className="text-text-lo">
              · parashikuar {formatALL(hover.yhat)}
              {!hover.in_band && " · jashtë brezit"}
            </span>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-4 text-[11px] text-text-lo">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent-2" /> brenda brezit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-danger" /> jashtë brezit
        </span>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  warn,
  good,
}: {
  label: string;
  value: string;
  sub?: string;
  warn?: boolean;
  good?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-lo">
        {label}
      </div>
      <div
        className={
          "mt-1 font-display text-[20px] font-semibold leading-none " +
          (warn ? "text-danger" : good ? "text-accent-2" : "text-text-hi")
        }
      >
        {value}
      </div>
      {sub && <p className="mt-1 text-[11px] text-text-mid">{sub}</p>}
    </div>
  );
}
