"use client";

import Link from "next/link";
import { IconChevronRight, IconUsers } from "@/components/icons";
import type { Workplace } from "@/lib/api";

function contactsLabel(n: number): string {
  if (n === 0) return "asnjë kontakt";
  if (n === 1) return "1 kontakt";
  return `${n} kontakte`;
}

export default function WorkplaceCard({ item }: { item: Workplace }) {
  return (
    <Link
      href={`/panel/burime-njerezore/${item.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent/40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-text-mid">
        <IconUsers size={18} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-display text-sm font-semibold text-text-hi">
          {item.name}
        </span>
        <span className="font-mono text-xs text-text-lo">
          {contactsLabel(item.contact_count)}
        </span>
      </span>
      <IconChevronRight
        size={16}
        className="shrink-0 text-text-lo transition-colors group-hover:text-text-mid"
      />
    </Link>
  );
}
