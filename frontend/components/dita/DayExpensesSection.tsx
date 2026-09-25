"use client";

import { useState } from "react";
import {
  ApiError,
  deleteExpense,
  type DayExpense,
  type Expense,
} from "@/lib/api";
import { formatALL } from "@/lib/money";
import { IconPencil, IconTrash, IconReceipt } from "@/components/icons";
import DaySection from "@/components/dita/DaySection";
import DayHeaderAction from "@/components/dita/DayHeaderAction";
import Confirm from "@/components/common/Confirm";
import ExpenseSheet from "@/components/shpenzime/ExpenseSheet";

interface Props {
  date: string;
  items: DayExpense[];
  total: string;
  categories: string[];
  onChanged: () => void;
}

function toExpense(item: DayExpense, date: string): Expense {
  return {
    id: item.id,
    amount: item.amount,
    category: item.category,
    entry_date: date,
    description: item.description,
    created_at: "",
    updated_at: "",
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

export default function DayExpensesSection({
  date,
  items,
  total,
  categories,
  onChanged,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<DayExpense | null>(null);
  const [toDelete, setToDelete] = useState<DayExpense | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteExpense(toDelete.id);
      setToDelete(null);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Fshirja dështoi");
    }
  };

  return (
    <>
      <DaySection
        icon={IconReceipt}
        title="Shpenzime"
        accent="orange"
        count={items.length}
        isEmpty={items.length === 0}
        emptyLabel="asnjë shpenzim atë ditë"
        action={
          <DayHeaderAction
            label="Shto shpenzim"
            onClick={() => {
              setEditing(null);
              setSheetOpen(true);
            }}
          />
        }
        footer={items.length > 0 ? <TotalFooter value={total} /> : undefined}
      >
        {items.map((e) => (
          <div
            key={e.id}
            className="flex items-start justify-between gap-3 px-4 py-2.5"
          >
            <span className="min-w-0 text-[13px] text-text-hi">
              <span className="font-medium">{e.category}</span>
              {e.description && (
                <span className="text-text-lo"> · {e.description}</span>
              )}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="font-mono text-[13px] font-semibold text-text-hi">
                {formatALL(e.amount)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditing(e);
                  setSheetOpen(true);
                }}
                aria-label="Redakto"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-text-hi"
              >
                <IconPencil size={13} />
              </button>
              <button
                type="button"
                onClick={() => setToDelete(e)}
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

      <ExpenseSheet
        key={editing?.id ?? "new"}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={onChanged}
        initial={editing ? toExpense(editing, date) : null}
        categories={categories}
        defaultDate={date}
      />

      <Confirm
        open={Boolean(toDelete)}
        title="Fshi shpenzimin"
        message={
          toDelete ? `Do të fshihet «${toDelete.category}».` : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
