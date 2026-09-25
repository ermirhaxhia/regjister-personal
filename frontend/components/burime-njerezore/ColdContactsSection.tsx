"use client";

import Link from "next/link";
import { daysSince } from "@/lib/date";
import { cn } from "@/lib/cn";
import { IconClock } from "@/components/icons";
import type { Contact, Workplace } from "@/lib/api";
import { fullName } from "@/components/hr/ContactsTable";
import { EmptyState } from "@/components/common/States";

const WARM_THRESHOLD = 21;
const COLD_THRESHOLD = 45;
const BAR_MAX_DAYS = 60;

interface Row {
  contact: Contact;
  workplaceName: string;
  days: number | null;
}

function toneFor(days: number | null): string {
  if (days == null || days >= COLD_THRESHOLD) return "text-accent";
  if (days >= WARM_THRESHOLD) return "text-[#e0a03c]";
  return "text-text-mid";
}

function barToneFor(days: number | null): string {
  if (days == null || days >= COLD_THRESHOLD) return "bg-accent";
  if (days >= WARM_THRESHOLD) return "bg-[#e0a03c]";
  return "bg-text-mid";
}

function barWidth(days: number | null): number {
  if (days == null) return 100;
  return Math.max(6, Math.min(100, Math.round((days / BAR_MAX_DAYS) * 100)));
}

interface Props {
  contacts: Contact[];
  workplaces: Workplace[];
}

export default function ColdContactsSection({ contacts, workplaces }: Props) {
  const nameById = new Map(workplaces.map((w) => [w.id, w.name]));

  const rows: Row[] = contacts
    .map((c) => ({
      contact: c,
      workplaceName: nameById.get(c.sector_id) ?? "—",
      days: c.last_note_date ? daysSince(c.last_note_date) : null,
    }))
    .sort((a, b) => {
      if (a.days == null && b.days == null) return 0;
      if (a.days == null) return -1;
      if (b.days == null) return 1;
      return b.days - a.days;
    })
    .slice(0, 12);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <IconClock size={16} className="text-text-lo" />
        <h2 className="font-display text-sm font-semibold tracking-tight text-text-hi">
          Kontakte të ftohura
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-lo">
          renditur sipas kohës nga shënimi i fundit
        </span>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Ende pa kolegë"
          hint="Shto kontakte te vendet e punës sipër për t'i parë këtu."
        />
      ) : (
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
        {rows.map(({ contact, workplaceName, days }) => (
          <Link
            key={contact.id}
            href={`/panel/burime-njerezore/${contact.sector_id}/${contact.id}`}
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.02]"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-medium text-text-hi">
                {fullName(contact)}
              </span>
              <span className="truncate text-xs text-text-lo">
                {workplaceName}
              </span>
            </span>

            <span className="hidden h-1.5 w-32 shrink-0 overflow-hidden rounded-full bg-surface-2 sm:block">
              <span
                className={cn("block h-full rounded-full", barToneFor(days))}
                style={{ width: `${barWidth(days)}%` }}
              />
            </span>

            <span
              className={cn(
                "w-16 shrink-0 text-right font-mono text-xs",
                toneFor(days),
              )}
            >
              {days == null ? "asnjëherë" : `${days} d`}
            </span>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}
