"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ApiError, createNote, deleteNote, type Contact, type DayNote } from "@/lib/api";
import { Field, inputClass } from "@/components/common/Field";
import { IconUsers, IconPlus, IconTrash } from "@/components/icons";
import DaySection from "@/components/dita/DaySection";

interface Props {
  date: string;
  items: DayNote[];
  contacts: Contact[];
  onChanged: () => void;
}

function contactLabel(c: Contact): string {
  return c.last_name ? `${c.name} ${c.last_name}` : c.name;
}

export default function DayNotesSection({
  date,
  items,
  contacts,
  onChanged,
}: Props) {
  const sorted = useMemo(
    () => [...contacts].sort((a, b) => contactLabel(a).localeCompare(contactLabel(b))),
    [contacts],
  );
  const [contactId, setContactId] = useState(sorted[0]?.id ?? "");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactId || !text.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await createNote(contactId, { note: text.trim(), contact_date: date });
      setText("");
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ruajtja dështoi");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (n: DayNote) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await deleteNote(n.colleague_id, n.id);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Fshirja dështoi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DaySection
      icon={IconUsers}
      title="Shënime"
      accent="violet"
      count={items.length}
      isEmpty={false}
    >
      {items.length === 0 && (
        <p className="px-4 pt-3 text-xs text-text-lo">asnjë shënim atë ditë</p>
      )}
      {items.map((n) => (
        <div key={n.id} className="flex items-start justify-between gap-2 px-4 py-2.5">
          <div className="min-w-0">
            <span className="text-[13px] font-medium text-text-hi">
              {n.colleague_name}
            </span>
            <p className="mt-1 text-xs text-text-mid">{n.note}</p>
          </div>
          <button
            type="button"
            onClick={() => remove(n)}
            disabled={busy}
            aria-label={`Fshi shënimin për ${n.colleague_name}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-lo transition-colors hover:text-danger disabled:opacity-50"
          >
            <IconTrash size={13} />
          </button>
        </div>
      ))}

      <div className="px-4 py-3">
        {sorted.length === 0 ? (
          <p className="text-xs text-text-lo">
            Ende pa kolegë.{" "}
            <Link href="/panel/burime-njerezore" className="text-accent-2 underline">
              Shto te Kolegët
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={add} className="flex flex-col gap-2.5">
            <Field label="Kolegu" htmlFor="dita-note-contact">
              <select
                id="dita-note-contact"
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className={inputClass}
              >
                {sorted.map((c) => (
                  <option key={c.id} value={c.id}>
                    {contactLabel(c)}
                  </option>
                ))}
              </select>
            </Field>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="Fakte pune…"
            />
            {error && <p className="text-[12px] text-danger">{error}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={busy || !text.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <IconPlus size={14} />
                {busy ? "Duke ruajtur…" : "Shënim"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DaySection>
  );
}
