"use client";

import { useEffect, useState } from "react";
import { getWorkSummary, type WorkSummary } from "@/lib/api";

function Tile({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rp-card rounded-[18px] border border-border bg-surface px-4 py-4 sm:px-[22px] sm:py-[18px]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-lo">
        {label}
      </div>
      <div className="mt-2 font-display text-[28px] font-semibold leading-none text-text-hi">
        {value}
        {unit && (
          <span className="ml-1 font-display text-xs font-normal text-text-lo">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export default function WorkSummaryStrip() {
  const [summary, setSummary] = useState<WorkSummary | null>(null);

  useEffect(() => {
    getWorkSummary()
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  if (!summary) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Tile label="Orë gjithsej (7 ditë)" value={summary.total_hours.toFixed(1)} unit="orë" />
      <Tile label="Ditë të punuara" value={String(summary.days_worked)} unit="/ 7" />
      <Tile
        label="Mesatarja / ditë"
        value={summary.avg_hours_per_day.toFixed(1)}
        unit="orë"
      />
    </div>
  );
}
