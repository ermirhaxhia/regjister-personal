"use client";

import { useState } from "react";
import Sheet from "@/components/common/Sheet";
import { Field, SubmitRow, inputClass } from "@/components/common/Field";
import { toDatetimeLocal, fromDatetimeLocal, durationLabel } from "@/lib/date";
import { ApiError, createSleep, updateSleep, type Sleep } from "@/lib/api";

type SaveMode = "create" | "update";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (row: Sleep, mode: SaveMode) => void;
  initial?: Sleep | null;
  defaultDate?: string;
}

function defaultStart(anchor?: string): string {
  const d = anchor ? new Date(`${anchor}T00:00:00`) : new Date();
  d.setHours(23, 0, 0, 0);
  if (!anchor) d.setDate(d.getDate() - 1);
  return toDatetimeLocal(d);
}

function defaultEnd(anchor?: string): string {
  const d = anchor ? new Date(`${anchor}T00:00:00`) : new Date();
  d.setHours(7, 0, 0, 0);
  if (anchor) d.setDate(d.getDate() + 1);
  return toDatetimeLocal(d);
}

export default function SleepSheet({
  open,
  onClose,
  onSaved,
  initial,
  defaultDate,
}: Props) {
  const editing = Boolean(initial);
  const [start, setStart] = useState(
    initial ? toDatetimeLocal(initial.sleep_start) : defaultStart(defaultDate),
  );
  const [end, setEnd] = useState(
    initial ? toDatetimeLocal(initial.sleep_end) : defaultEnd(defaultDate),
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startMs = start ? new Date(start).getTime() : NaN;
  const endMs = end ? new Date(end).getTime() : NaN;
  const ordered = Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs;
  const mins = ordered ? (endMs - startMs) / 60000 : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordered || busy) return;
    setBusy(true);
    setError(null);
    try {
      const body = {
        sleep_start: fromDatetimeLocal(start),
        sleep_end: fromDatetimeLocal(end),
        note: note.trim() || null,
      };
      const row =
        editing && initial
          ? await updateSleep(initial.id, body)
          : await createSleep(body);
      onSaved(row, editing ? "update" : "create");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ruajtja dështoi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={open}
      title={editing ? "Ndrysho gjumin" : "Shto gjumë"}
      onClose={onClose}
    >
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <Field label="Fillimi (ra në gjumë)">
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field
          label="Fundi (u zgjua)"
          error={
            !ordered && start && end
              ? "Fundi duhet të jetë pas fillimit."
              : undefined
          }
          hint={ordered ? `Kohëzgjatja: ${durationLabel(mins)}` : undefined}
        >
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className={inputClass}
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
          submitLabel={editing ? "Ruaj" : "Shto"}
        />
      </form>
    </Sheet>
  );
}
