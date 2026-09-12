"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatALL, formatSigned } from "@/lib/money";
import type { SummaryBudget } from "@/lib/api";

export default function PaydayCard({ budget }: { budget: SummaryBudget | null }) {
  if (!budget) {
    return (
      <div className="rp-card flex flex-col gap-2 rounded-[18px] border border-border bg-surface px-4 py-4 sm:px-[22px] sm:py-[18px]">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-lo">
          Deri te paga tjetër
        </span>
        <p className="text-[13px] text-text-mid">
          Shto pagën te{" "}
          <Link href="/panel/te-ardhura" className="text-accent">
            «Të ardhura»
          </Link>{" "}
          për të parë parashikimin.
        </p>
      </div>
    );
  }

  const {
    days_to_next_salary,
    personal_allocation,
    spent_since_salary,
    projected_at_payday,
  } = budget;

  const ratio =
    personal_allocation > 0 ? spent_since_salary / personal_allocation : 0;
  const frac = Math.min(Math.max(ratio, 0), 1);
  const over = ratio >= 1;
  const ringColor = over ? "#ff5b5b" : "#FF7A3C";

  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = circ * frac;
  const hasProjection = projected_at_payday !== null;
  const projNonNeg = hasProjection && projected_at_payday >= 0;

  return (
    <div className="rp-card flex items-center gap-4 rounded-[18px] border border-border bg-surface px-4 py-4 sm:gap-[18px] sm:px-[22px] sm:py-[18px]">
      <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true" className="shrink-0">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#22222a" strokeWidth="7" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 36 36)"
        />
        <text
          x="36"
          y="34"
          textAnchor="middle"
          fill="#f7f7f8"
          fontSize="16"
          fontFamily="var(--font-display)"
        >
          {days_to_next_salary}
        </text>
        <text x="36" y="46" textAnchor="middle" fill="#8a8a95" fontSize="8">
          ditë
        </text>
      </svg>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-lo">
          Deri te paga tjetër
        </div>
        <p className="mt-2 text-[11.5px] leading-relaxed text-text-mid">
          Shpenzuar{" "}
          <span className={cn(over ? "text-danger" : "text-text-hi")}>
            {formatALL(spent_since_salary)}
          </span>{" "}
          nga {formatALL(personal_allocation)} personale
        </p>
        {hasProjection ? (
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-text-mid">
            Parashikim te paga:{" "}
            <span
              className={cn(
                "font-display text-[13px] font-semibold",
                projNonNeg ? "text-success" : "text-danger",
              )}
            >
              {formatSigned(projected_at_payday)}
            </span>
            {!projNonNeg && " · do të dalësh minus"}
          </p>
        ) : (
          <p className="mt-1.5 text-[11.5px] text-text-lo">
            Parashikimi del pas disa ditësh të para nga paga.
          </p>
        )}
      </div>
    </div>
  );
}
