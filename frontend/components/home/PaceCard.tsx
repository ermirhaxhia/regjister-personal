"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatALL } from "@/lib/money";
import type { SummaryBudget } from "@/lib/api";

export default function PaceCard({ budget }: { budget: SummaryBudget | null }) {
  if (!budget) {
    return (
      <div className="rp-card flex flex-col gap-2 rounded-[18px] border border-border bg-surface px-4 py-4 sm:px-[22px] sm:py-[18px]">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-lo">
          Ritmi i shpenzimit
        </span>
        <p className="text-[13px] text-text-mid">
          Shto pagën te{" "}
          <Link href="/panel/te-ardhura" className="text-accent">
            «Të ardhura»
          </Link>{" "}
          për të parë buxhetin.
        </p>
      </div>
    );
  }

  const { daily_rate, daily_allowed } = budget;
  const ratio = daily_allowed > 0 ? daily_rate / daily_allowed : 0;
  const pct = Math.min(Math.max(ratio, 0), 1) * 100;
  const over = daily_rate > daily_allowed;
  const diffPct =
    daily_allowed > 0
      ? Math.round(((daily_rate - daily_allowed) / daily_allowed) * 100)
      : 0;

  return (
    <div className="rp-card rounded-[18px] border border-border bg-surface px-4 py-4 sm:px-[22px] sm:py-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-lo">
          Ritmi i shpenzimit
        </span>
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 font-mono text-[10.5px]",
            over
              ? "border-danger/35 bg-danger/18 text-danger"
              : "border-success/35 bg-success/18 text-success",
          )}
        >
          {over ? `+${diffPct}% mbi lejuar` : `${diffPct}% brenda`}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-2xl font-semibold text-text-hi">
          {formatALL(daily_rate).replace(" L", "")}
        </span>
        <span className="text-xs text-text-lo">
          L / ditë · buxheti lejon {formatALL(daily_allowed)}
        </span>
      </div>

      <div className="rp-bar mt-3.5 h-2.5 overflow-hidden rounded-full bg-surface-2">
        <span
          style={{ width: `${pct}%` }}
          className={cn(
            over
              ? "bg-danger"
              : "bg-[linear-gradient(90deg,#34dd93,#8b7bff)]",
          )}
        />
      </div>

      <p className="mt-2.5 text-[10.5px] leading-relaxed text-text-lo">
        Nga pjesa «personale» e pagës / 30 ditë. Mbetur:{" "}
        {formatALL(budget.remaining)}.
      </p>
    </div>
  );
}
