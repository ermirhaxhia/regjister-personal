"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { dayMonth, daysSince } from "@/lib/date";
import { IconChevronRight } from "@/components/icons";
import type { Contact } from "@/lib/api";

interface Props {
  base: string;
  items: Contact[];
}

export function fullName(c: Contact): string {
  return [c.name, c.last_name].filter(Boolean).join(" ");
}

function LastContact({ date }: { date: string | null }) {
  if (!date) return <span className="font-mono text-xs text-text-lo">—</span>;
  const d = daysSince(date);
  const tone =
    d >= 45 ? "text-accent" : d >= 21 ? "text-[#e0a03c]" : "text-text-mid";
  return (
    <span className="font-mono text-xs">
      <span className="text-text-lo">{dayMonth(date)}</span>
      <span className={cn("ml-1.5", tone)}>{d} d</span>
    </span>
  );
}

export default function ContactsTable({ base, items }: Props) {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="hidden w-full overflow-hidden rounded-2xl border border-border bg-surface md:block">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col />
            <col style={{ width: "180px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "170px" }} />
          </colgroup>
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-[0.1em] text-text-lo">
              <th className="border-b border-border px-4 py-3 font-normal">
                Emri
              </th>
              <th className="border-b border-border px-4 py-3 font-normal">
                Pozicioni
              </th>
              <th className="border-b border-border px-4 py-3 font-normal">
                Telefon
              </th>
              <th className="border-b border-border px-4 py-3 font-normal">
                Kontakti i fundit
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr
                key={c.id}
                onClick={() => router.push(`${base}/${c.id}`)}
                className="h-14 cursor-pointer border-b border-border last:border-0 hover:bg-white/[0.02]"
              >
                <td className="truncate px-4">
                  <Link
                    href={`${base}/${c.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-medium text-text-hi hover:text-accent"
                  >
                    {fullName(c)}
                  </Link>
                </td>
                <td className="truncate px-4 text-sm text-text-mid">
                  {c.role || "—"}
                </td>
                <td className="truncate px-4 font-mono text-xs text-text-mid">
                  {c.phone || "—"}
                </td>
                <td className="px-4">
                  <LastContact date={c.last_note_date} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2.5 md:hidden">
        {items.map((c) => (
          <Link
            key={c.id}
            href={`${base}/${c.id}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-sm font-semibold text-text-hi">
                {fullName(c)}
              </span>
              <span className="truncate text-xs text-text-mid">
                {c.role || "—"}
                {c.phone ? ` · ${c.phone}` : ""}
              </span>
              <span className="text-xs text-text-lo">
                kontakti i fundit:{" "}
                {c.last_note_date ? dayMonth(c.last_note_date) : "—"}
              </span>
            </span>
            <IconChevronRight size={16} className="shrink-0 text-text-lo" />
          </Link>
        ))}
      </div>
    </div>
  );
}
