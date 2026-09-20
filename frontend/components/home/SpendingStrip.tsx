"use client";

import { formatALL } from "@/lib/money";
import type { SummarySpending } from "@/lib/api";
import Delta from "@/components/home/Delta";

export default function SpendingStrip({ s }: { s: SummarySpending }) {
  return (
    <div className="rp-card grid grid-cols-1 rounded-[18px] border border-border bg-surface min-[560px]:grid-cols-3">
      <div className="border-b border-border px-4 py-2.5 sm:px-[22px] min-[560px]:col-span-3">
        <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-text-lo">
          Shpenzimet
        </span>
      </div>
      <Cell label="Sot" value={s.today}>
        <span className="font-mono text-[11px] text-text-lo">
          dje {formatALL(s.yesterday)}
        </span>
      </Cell>
      <Cell label="Java aktuale" value={s.week_current} divider>
        <Delta current={s.week_current} previous={s.week_previous} suffix=" vs java e kaluar" />
      </Cell>
      <Cell label="Muaji" value={s.month_current} divider>
        <Delta current={s.month_current} previous={s.month_previous} suffix=" vs muaji i kaluar" />
      </Cell>
    </div>
  );
}

function Cell({
  label,
  value,
  divider,
  children,
}: {
  label: string;
  value: number;
  divider?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        divider
          ? "border-t border-border px-4 py-4 min-[560px]:border-l min-[560px]:border-t-0 sm:px-[22px]"
          : "px-4 py-4 sm:px-[22px]"
      }
    >
      <div className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-text-lo sm:text-[10px]">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-lg font-semibold text-text-hi sm:text-[22px]">
          {formatALL(value).replace(" L", "")}
        </span>
        <span className="font-display text-[11px] text-text-lo sm:text-xs">L</span>
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
