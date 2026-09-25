"use client";

import Link from "next/link";
import { dayMonth } from "@/lib/date";
import { IconPencil, IconTrash } from "@/components/icons";
import type { Collection } from "@/lib/api";

interface Props {
  habitId: string;
  collection: Collection;
  unitLabel: string;
  onEdit?: (c: Collection) => void;
  onDelete?: (c: Collection) => void;
}

export default function CollectionCard({
  habitId,
  collection,
  unitLabel,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Link
      href={`/panel/zakone/koleksion/${habitId}/${collection.id}`}
      className="rp-card flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent-2/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-display text-sm font-semibold text-text-hi">
            {collection.name}
          </span>
          <span className="font-mono text-[11px] text-text-lo">
            {collection.amount_total} {unitLabel}
            {collection.total_amount != null ? ` / ${collection.total_amount}` : ""}
          </span>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex shrink-0 items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onEdit(collection);
                }}
                aria-label={`Ndrysho ${collection.name}`}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-text-hi"
              >
                <IconPencil size={13} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(collection);
                }}
                aria-label={`Fshi ${collection.name}`}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-danger"
              >
                <IconTrash size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {collection.total_amount != null && collection.pct_complete != null && (
        <div className="flex flex-col gap-1.5">
          <span className="h-1.5 w-full overflow-hidden rounded-full bg-[#22222a]">
            <span
              className="block h-full rounded-full bg-accent-2"
              style={{ width: `${collection.pct_complete}%` }}
            />
          </span>
          <span className="font-mono text-[11px] text-text-mid">
            {collection.pct_complete}%
          </span>
        </div>
      )}

      {collection.amount_per_day != null && (
        <span className="font-mono text-[11px] text-text-lo">
          ≈ {collection.amount_per_day.toFixed(1)} {unitLabel}/ditë
          {collection.estimated_finish
            ? ` · mbarim ~${dayMonth(collection.estimated_finish)}`
            : ""}
        </span>
      )}
    </Link>
  );
}
