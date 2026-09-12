"use client";

import { useCallback, useState } from "react";
import {
  ApiError,
  listNotes,
  createNote,
  updateNote,
  deleteNote,
  type ContactNote,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { todayISO } from "@/lib/date";
import { Field, inputClass } from "@/components/common/Field";
import { LoadingBlock, ErrorState } from "@/components/common/States";
import Confirm from "@/components/common/Confirm";
import { IconPlus } from "@/components/icons";
import NoteRow from "@/components/hr/NoteRow";

const HINT =
  "Çfarë folët, pse u takuat, çfarë bëtë — vetëm fakte pune, jo gjykime personale.";

function sortNotes(list: ContactNote[]): ContactNote[] {
  return [...list].sort((a, b) =>
    a.contact_date === b.contact_date
      ? b.created_at.localeCompare(a.created_at)
      : b.contact_date.localeCompare(a.contact_date),
  );
}

export default function ContactNotes({ contactId }: { contactId: string }) {
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [text, setText] = useState("");
  const [date, setDate] = useState(todayISO());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ContactNote | null>(null);

  const fetcher = useCallback(() => listNotes(contactId), [contactId]);
  const apply = useCallback((list: ContactNote[]) => setNotes(sortNotes(list)), []);
  const { status, reload } = useGenLoad(fetcher, apply);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const row = await createNote(contactId, {
        note: text.trim(),
        contact_date: date,
      });
      setNotes((prev) => sortNotes([row, ...prev]));
      setText("");
      setDate(todayISO());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ruajtja dështoi.");
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async (
    id: string,
    patch: { note: string; contact_date: string },
  ) => {
    const row = await updateNote(contactId, id, patch);
    setNotes((prev) => sortNotes(prev.map((n) => (n.id === id ? row : n))));
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteNote(contactId, toDelete.id);
      setNotes((prev) => prev.filter((n) => n.id !== toDelete.id));
      setToDelete(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Fshirja dështoi.");
    }
  };

  return (
    <section className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="font-display text-sm font-semibold text-text-hi">Shënime</h2>

      <form
        onSubmit={add}
        className="flex flex-col gap-3 rounded-xl border border-border bg-surface-2/40 p-4"
      >
        <Field label="Data">
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Shënim" hint={HINT}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className={`${inputClass} resize-y`}
            placeholder="Fakte pune…"
          />
        </Field>
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

      {status === "loading" && <LoadingBlock lines={2} />}
      {status === "error" && (
        <ErrorState message="Shënimet nuk u ngarkuan." onRetry={reload} />
      )}
      {(status === "ready" || status === "refreshing") &&
        (notes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface-2/30 px-4 py-6 text-center text-xs text-text-lo">
            Ende pa shënime. Shto të parin lart.
          </p>
        ) : (
          <ul className="flex flex-col">
            {notes.map((n) => (
              <NoteRow
                key={n.id}
                note={n}
                onSave={(patch) => saveEdit(n.id, patch)}
                onDelete={() => setToDelete(n)}
              />
            ))}
          </ul>
        ))}

      <Confirm
        open={Boolean(toDelete)}
        title="Fshi shënimin"
        message="Ky shënim do të fshihet përfundimisht."
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
