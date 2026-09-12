"use client";

import { formatALL } from "@/lib/money";
import { dayMonth } from "@/lib/date";
import { IconPencil, IconTrash } from "@/components/icons";
import type { Expense } from "@/lib/api";

interface Props {
  items: Expense[];
  onEdit: (e: Expense) => void;
  onDelete: (e: Expense) => void;
}

export default function ExpenseList({ items, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="hidden grid-cols-[80px_1fr_1fr_120px_72px] gap-3 border-b border-border px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-lo sm:grid">
        <span>Data</span>
        <span>Kategori</span>
        <span>Përshkrim</span>
        <span className="text-right">Shuma</span>
        <span />
      </div>
      <ul>
        {items.map((e) => (
          <li
            key={e.id}
            className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 border-b border-border px-4 py-3 last:border-0 sm:grid-cols-[80px_1fr_1fr_120px_72px]"
          >
            <span className="order-1 font-mono text-xs text-text-lo sm:order-none">
              {dayMonth(e.entry_date)}
            </span>
            <span className="order-3 col-span-2 text-sm text-text-hi sm:order-none sm:col-span-1">
              {e.category}
            </span>
            <span className="order-4 col-span-2 truncate text-xs text-text-mid sm:order-none sm:col-span-1">
              {e.description || "—"}
            </span>
            <span className="order-2 text-right font-mono text-sm font-semibold text-text-hi sm:order-none">
              {formatALL(e.amount)}
            </span>
            <span className="order-5 flex justify-end gap-1 sm:order-none">
              <button
                type="button"
                onClick={() => onEdit(e)}
                aria-label="Redakto"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-text-hi"
              >
                <IconPencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(e)}
                aria-label="Fshi"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-danger"
              >
                <IconTrash size={14} />
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
