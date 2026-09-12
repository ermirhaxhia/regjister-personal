"use client";

import { formatALL } from "@/lib/money";
import { dayMonth } from "@/lib/date";
import type { Summary } from "@/lib/api";

export default function HighlightRow({ summary }: { summary: Summary }) {
  const big = summary.biggest_expense_week;
  const top = summary.top_category_month;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rp-card flex items-center justify-between rounded-2xl border border-border bg-[#0f0f12] px-5 py-4">
        <div>
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-text-lo">
            Shpenzimi më i madh · java
          </div>
          <div className="mt-2 text-[13px] text-text-mid">
            {big ? `${big.category} · ${dayMonth(big.date)}` : "—"}
          </div>
        </div>
        <span className="font-mono text-[15px] font-semibold text-text-hi">
          {big ? formatALL(big.amount) : "—"}
        </span>
      </div>

      <div className="rp-card rounded-2xl border border-border bg-[#0f0f12] px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-text-lo">
            Kategoria kryesore · muaji
          </span>
          <span className="text-[13px] font-semibold text-text-mid">
            {top ? `${top.category} · ${top.pct}%` : "—"}
          </span>
        </div>
        <div className="rp-bar mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
          <span
            style={{ width: `${top ? top.pct : 0}%` }}
            className="bg-accent"
          />
        </div>
      </div>
    </div>
  );
}
