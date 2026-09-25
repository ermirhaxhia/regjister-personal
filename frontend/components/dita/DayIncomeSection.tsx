"use client";

import { useState } from "react";
import {
  ApiError,
  deleteIncome,
  type DayIncome,
  type Income,
} from "@/lib/api";
import { formatALL } from "@/lib/money";
import { IconPencil, IconTrash, IconBanknote } from "@/components/icons";
import DaySection from "@/components/dita/DaySection";
import DayHeaderAction from "@/components/dita/DayHeaderAction";
import Confirm from "@/components/common/Confirm";
import IncomeSheet from "@/components/te-ardhura/IncomeSheet";

interface Props {
  date: string;
  items: DayIncome[];
  total: string;
  sources: string[];
  onChanged: () => void;
}

function toIncome(item: DayIncome, date: string): Income {
  return {
    id: item.id,
    amount: item.amount,
    kind: item.kind,
    period_month: date,
    received_on: date,
    source: item.source,
    note: item.note,
    created_at: "",
    updated_at: "",
    allocations: [],
  };
}

function TotalFooter({ value }: { value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-lo">
        Gjithsej
      </span>
      <span className="font-mono text-[13px] font-semibold text-text-hi">
        {formatALL(value)}
      </span>
    </div>
  );
}

export default function DayIncomeSection({
  date,
  items,
  total,
  sources,
  onChanged,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<DayIncome | null>(null);
  const [toDelete, setToDelete] = useState<DayIncome | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteIncome(toDelete.id);
      setToDelete(null);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Fshirja dështoi");
    }
  };

  return (
    <>
      <DaySection
        icon={IconBanknote}
        title="Të ardhura"
        accent="orange"
        count={items.length}
        isEmpty={items.length === 0}
        emptyLabel="asnjë e ardhur atë ditë"
        action={
          <DayHeaderAction
            label="Shto të ardhur"
            onClick={() => {
              setEditing(null);
              setSheetOpen(true);
            }}
          />
        }
        footer={items.length > 0 ? <TotalFooter value={total} /> : undefined}
      >
        {items.map((i) => (
          <div
            key={i.id}
            className="flex items-start justify-between gap-3 px-4 py-2.5"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-[13px] text-text-hi">
                {i.source ?? i.kind}
              </span>
              <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-text-lo">
                {i.kind}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="font-mono text-[13px] font-semibold text-text-hi">
                {formatALL(i.amount)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditing(i);
                  setSheetOpen(true);
                }}
                aria-label="Redakto"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-text-hi"
              >
                <IconPencil size={13} />
              </button>
              <button
                type="button"
                onClick={() => setToDelete(i)}
                aria-label="Fshi"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-danger"
              >
                <IconTrash size={13} />
              </button>
            </span>
          </div>
        ))}
      </DaySection>

      {error && <p className="px-1 text-[12px] text-danger">{error}</p>}

      <IncomeSheet
        key={editing?.id ?? "new"}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={onChanged}
        initial={editing ? toIncome(editing, date) : null}
        sources={sources}
        defaultDate={date}
      />

      <Confirm
        open={Boolean(toDelete)}
        title="Fshi të ardhurën"
        message={toDelete ? `Do të fshihet e ardhura ${formatALL(toDelete.amount)}.` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
