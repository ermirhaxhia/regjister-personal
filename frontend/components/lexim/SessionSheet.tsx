"use client";

import { useState } from "react";
import Sheet from "@/components/common/Sheet";
import { Field, SubmitRow, inputClass } from "@/components/common/Field";
import { todayISO } from "@/lib/date";
import {
  ApiError,
  createReadingSession,
  type ReadingSession,
} from "@/lib/api";

interface Props {
  open: boolean;
  bookId: string;
  defaultDate: string;
  onClose: () => void;
  onSaved: (row: ReadingSession) => void;
}

export default function SessionSheet({
  open,
  bookId,
  defaultDate,
  onClose,
  onSaved,
}: Props) {
  const [date, setDate] = useState(defaultDate || todayISO());
  const [pages, setPages] = useState("");
  const [minutes, setMinutes] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pagesNum = Number(pages);
  const valid =
    Number.isFinite(pagesNum) && pagesNum > 0 && Number.isInteger(pagesNum);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const minutesNum = minutes.trim() ? Number(minutes) : undefined;
      const row = await createReadingSession(bookId, {
        session_date: date,
        pages_read: pagesNum,
        minutes: minutesNum,
        note: note.trim() || null,
      });
      onSaved(row);
      setPages("");
      setMinutes("");
      setNote("");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ruajtja dështoi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} title="Sesion i ri" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <Field label="Data">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Faqe të lexuara">
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            autoFocus
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            className={inputClass}
            placeholder="0"
          />
        </Field>

        <Field label="Minuta (opsionale)">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className={inputClass}
            placeholder="—"
          />
        </Field>

        <Field label="Shënim (opsional)">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={inputClass}
            placeholder="—"
          />
        </Field>

        <SubmitRow
          busy={busy}
          error={error}
          onCancel={onClose}
          submitLabel="Shto"
          disabled={!valid}
        />
      </form>
    </Sheet>
  );
}
