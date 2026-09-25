"use client";

import type { WeeklyMetric } from "@/lib/api";

interface Props {
  label: string;
  metric: WeeklyMetric;
  formatValue: (n: number) => string;
  formatDiff: (diff: number) => string;
}

export default function WeeklyMetricTile({
  label,
  metric,
  formatValue,
  formatDiff,
}: Props) {
  const { current, previous } = metric;

  let sub: React.ReactNode = "s'ka të dhëna të mjaftueshme";
  if (current != null && previous != null) {
    const diff = current - previous;
    if (diff === 0) {
      sub = "njësoj si java e kaluar";
    } else {
      const arrow = diff > 0 ? "▲" : "▼";
      const color = diff > 0 ? "text-success" : "text-danger";
      sub = (
        <>
          <span className={color}>
            {arrow} {formatDiff(Math.abs(diff))}
          </span>{" "}
          nga java e kaluar
        </>
      );
    }
  } else if (current != null) {
    sub = "pa krahasim, java e kaluar bosh";
  }

  return (
    <div className="rp-card rounded-[18px] border border-border bg-surface px-4 py-4 sm:px-[22px] sm:py-[18px]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-lo">
        {label}
      </div>
      <div className="mt-2 font-display text-[28px] font-semibold leading-none text-text-hi">
        {current != null ? formatValue(current) : <span className="text-text-lo">—</span>}
      </div>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-text-mid">{sub}</p>
    </div>
  );
}
