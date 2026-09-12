"use client";

import { dayMonth, fullDate } from "@/lib/date";
import { describeValues } from "@/lib/fitnessUnits";
import { IconPencil, IconTrash } from "@/components/icons";
import type { FitnessEntry } from "@/lib/api";

interface Props {
  items: FitnessEntry[];
  onEdit: (e: FitnessEntry) => void;
  onDelete: (e: FitnessEntry) => void;
}

function Actions({
  e,
  onEdit,
  onDelete,
}: {
  e: FitnessEntry;
  onEdit: (e: FitnessEntry) => void;
  onDelete: (e: FitnessEntry) => void;
}) {
  return (
    <span className="flex justify-end gap-1">
      <button
        type="button"
        onClick={() => onEdit(e)}
        aria-label="Redakto"
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-text-hi"
      >
        <IconPencil size={13} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(e)}
        aria-label="Fshi"
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-danger"
      >
        <IconTrash size={13} />
      </button>
    </span>
  );
}

export default function EntriesTable({ items, onEdit, onDelete }: Props) {
  return (
    <section className="flex w-full flex-col gap-3">
      <h2 className="font-display text-sm font-semibold text-text-hi">Hyrjet</h2>

      <div className="hidden w-full overflow-hidden rounded-2xl border border-border bg-surface md:block">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col style={{ width: "120px" }} />
            <col style={{ width: "170px" }} />
            <col style={{ width: "240px" }} />
            <col />
            <col style={{ width: "72px" }} />
          </colgroup>
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-[0.1em] text-text-lo">
              <th className="border-b border-border px-4 py-3 font-normal">
                Data
              </th>
              <th className="border-b border-border px-4 py-3 font-normal">
                Lloji
              </th>
              <th className="border-b border-border px-4 py-3 font-normal">
                Vlerat
              </th>
              <th className="border-b border-border px-4 py-3 font-normal">
                Shënim
              </th>
              <th className="border-b border-border px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr
                key={e.id}
                className="h-14 border-b border-border last:border-0 hover:bg-white/[0.02]"
              >
                <td className="px-4 font-mono text-xs text-text-lo">
                  {dayMonth(e.entry_date)}
                </td>
                <td className="truncate px-4 text-sm text-text-hi">
                  {e.activity_type_name ?? "—"}
                </td>
                <td className="px-4 font-mono text-[13px] text-text-mid">
                  {describeValues(e.values)}
                </td>
                <td className="truncate px-4 text-sm text-text-mid">
                  {e.note || "—"}
                </td>
                <td className="px-2">
                  <Actions e={e} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {items.map((e) => (
          <article
            key={e.id}
            className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="font-display text-sm font-semibold text-text-hi">
                  {e.activity_type_name ?? "—"}
                </span>
                <span className="font-mono text-[11px] text-text-lo">
                  {fullDate(e.entry_date)}
                </span>
              </div>
              <Actions e={e} onEdit={onEdit} onDelete={onDelete} />
            </div>
            <span className="font-mono text-sm text-text-hi">
              {describeValues(e.values)}
            </span>
            {e.note && (
              <span className="border-t border-border pt-2 text-xs text-text-mid">
                {e.note}
              </span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
