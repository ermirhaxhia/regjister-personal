"use client";

import Link from "next/link";
import { dayMonth } from "@/lib/date";
import type { Book } from "@/lib/api";

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/panel/zakone/lexim/${book.id}`}
      className="rp-card flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent-2/40"
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-display text-sm font-semibold text-text-hi">
          {book.title}
        </span>
        {book.author && (
          <span className="truncate text-xs text-text-lo">{book.author}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="h-1.5 w-full overflow-hidden rounded-full bg-[#22222a]">
          <span
            className="block h-full rounded-full bg-accent-2"
            style={{ width: `${book.pct_complete}%` }}
          />
        </span>
        <span className="font-mono text-[11px] text-text-mid">
          {book.pages_read} / {book.total_pages} faqe
        </span>
      </div>

      {book.pages_per_day != null && (
        <span className="font-mono text-[11px] text-text-lo">
          ≈ {book.pages_per_day.toFixed(1)} faqe/ditë
          {book.estimated_finish
            ? ` · mbarim ~${dayMonth(book.estimated_finish)}`
            : ""}
        </span>
      )}
    </Link>
  );
}
