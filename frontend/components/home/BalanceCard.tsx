"use client";

import { cn } from "@/lib/cn";
import { formatALL, formatSigned } from "@/lib/money";
import { dayMonthShort } from "@/lib/date";
import { IconTrendUp, IconTrendDown } from "@/components/icons";
import type { Summary } from "@/lib/api";
import Sparkline from "@/components/home/Sparkline";

export default function BalanceCard({ summary }: { summary: Summary }) {
  const change = summary.balance_change_month;
  const positive = change >= 0;
  const series = summary.series_30d;
  const first = series[0]?.date;
  const last = series[series.length - 1]?.date;

  const forecast = summary.forecast;
  const fcReady = forecast?.ready === true;
  const fcPoints = fcReady && forecast ? forecast.points : [];
  const rightLabel =
    fcPoints.length > 0 ? fcPoints[fcPoints.length - 1].date : last;

  let fcLine: string | null = null;
  if (fcReady && forecast && forecast.total != null) {
    fcLine = `≈ ${formatALL(forecast.total)} / ${forecast.horizon} ditë`;
    if (forecast.total_lo != null && forecast.total_hi != null) {
      const lo = formatALL(forecast.total_lo).replace(" L", "");
      const hi = formatALL(forecast.total_hi).replace(" L", "");
      fcLine += ` · interval ${lo}–${hi}`;
    }
  }

  return (
    <div className="rp-card rounded-[18px] border border-border bg-surface px-5 py-5 sm:px-[22px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-lo">
            Balanca e disponueshme
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-[32px] font-semibold leading-none tracking-tight text-text-hi sm:text-[40px]">
              {formatALL(summary.balance_total).replace(" L", "")}
            </span>
            <span className="font-display text-base text-text-lo">L</span>
          </div>
        </div>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-mono text-[11px]",
            positive
              ? "border-success/35 bg-success/18 text-success"
              : "border-danger/35 bg-danger/18 text-danger",
          )}
        >
          {positive ? <IconTrendUp size={13} /> : <IconTrendDown size={13} />}
          {formatSigned(change)} këtë muaj
        </span>
      </div>

      <Sparkline points={series} forecast={fcPoints} />

      {first && rightLabel && (
        <div className="mt-0.5 flex justify-between font-mono text-[9.5px] text-text-lo">
          <span>{dayMonthShort(first)}</span>
          <span>{dayMonthShort(rightLabel)}</span>
        </div>
      )}

      {fcLine && (
        <div className="mt-1 font-mono text-[11px] text-text-lo">{fcLine}</div>
      )}

      {forecast && !forecast.ready && forecast.reason && (
        <div className="mt-1 text-[10px] text-text-lo/80">{forecast.reason}</div>
      )}
    </div>
  );
}
