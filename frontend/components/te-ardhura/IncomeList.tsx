"use client";

import { formatALL } from "@/lib/money";
import { monthLabel, dayMonth } from "@/lib/date";
import { IconPencil, IconTrash } from "@/components/icons";
import type { Income } from "@/lib/api";

interface Props {
  items: Income[];
  onEdit: (i: Income) => void;
  onDelete: (i: Income) => void;
}

export default function IncomeList({ items, onEdit, onDelete }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((inc) => {
        const total = Number(inc.amount);
        const isPaga = inc.kind === "paga";
        const personale = inc.allocations.find((a) => a.bucket === "personale");
        const familje = inc.allocations.find((a) => a.bucket === "familje");
        return (
          <div
            key={`${inc.id}:${inc.kind}:${inc.updated_at}`}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm font-semibold text-text-hi">
                    {monthLabel(inc.period_month)}
                  </span>
                  <KindBadge paga={isPaga} />
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-text-lo">
                  marrë {dayMonth(inc.received_on)}
                  {inc.source ? ` · ${inc.source}` : ""}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-sm font-semibold text-text-hi">
                  {formatALL(inc.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => onEdit(inc)}
                  aria-label="Redakto"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-text-hi"
                >
                  <IconPencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(inc)}
                  aria-label="Fshi"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-danger"
                >
                  <IconTrash size={14} />
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {isPaga ? (
                <>
                  <AllocBar
                    label="Personale"
                    amount={personale ? Number(personale.amount) : total / 2}
                    total={total}
                    color="bg-accent"
                  />
                  <AllocBar
                    label="Familje"
                    amount={familje ? Number(familje.amount) : total / 2}
                    total={total}
                    color="bg-accent-2"
                  />
                </>
              ) : (
                <AllocBar
                  label="Personale · 100%"
                  amount={personale ? Number(personale.amount) : total}
                  total={total}
                  color="bg-accent"
                  fill
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KindBadge({ paga }: { paga: boolean }) {
  return (
    <span
      className={
        paga
          ? "rounded-full border border-accent/35 bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-accent"
          : "rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-mid"
      }
    >
      {paga ? "PAGA" : "TJETËR"}
    </span>
  );
}

function AllocBar({
  label,
  amount,
  total,
  color,
  fill,
}: {
  label: string;
  amount: number;
  total: number;
  color: string;
  fill?: boolean;
}) {
  const pct = fill ? 100 : total > 0 ? (amount / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px]">
        <span className="text-text-mid">{label}</span>
        <span className="font-mono text-text-lo">{formatALL(amount)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <span
          className={`block h-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
