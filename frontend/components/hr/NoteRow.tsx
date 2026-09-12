"use client";

import { useState } from "react";
import { dayMonth, todayISO } from "@/lib/date";
import { inputClass } from "@/components/common/Field";
import { IconPencil, IconTrash } from "@/components/icons";
import type { ContactNote } from "@/lib/api";

interface Props {
  note: ContactNote;
  onSave: (patch: { note: string; contact_date: string }) => Promise<void>;
  onDelete: () => void;
}

export default function NoteRow({ note, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.note);
  const [date, setDate] = useState(note.contact_date);
  const [busy, setBusy] = useState(false);

  const start = () => {
    setText(note.note);
    setDate(note.contact_date);
    setEditing(true);
  };

  const save = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      await onSave({ note: text.trim(), contact_date: date });
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <li className="flex flex-col gap-2 border-b border-border py-3 last:border-0">
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className={`${inputClass} resize-y`}
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={busy}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-mid transition-colors hover:text-text-hi disabled:opacity-50"
          >
            Anulo
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy || !text.trim()}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Duke ruajtur…" : "Ruaj"}
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex gap-3 border-b border-border py-3 last:border-0">
      <span className="w-14 shrink-0 pt-0.5 font-mono text-xs text-text-lo">
        {dayMonth(note.contact_date)}
      </span>
      <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm text-text-mid">
        {note.note}
      </p>
      <span className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={start}
          aria-label="Redakto shënimin"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-text-hi"
        >
          <IconPencil size={13} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Fshi shënimin"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-danger"
        >
          <IconTrash size={13} />
        </button>
      </span>
    </li>
  );
}
