"use client";

import { useEffect, useState } from "react";
import Sheet from "@/components/common/Sheet";
import { Field, SubmitRow, inputClass } from "@/components/common/Field";
import { toDatetimeLocal, fromDatetimeLocal, durationLabel } from "@/lib/date";
import {
  ApiError,
  createWorkSession,
  updateWorkSession,
  listWorkplaces,
  type WorkSession,
  type Workplace,
} from "@/lib/api";

type SaveMode = "create" | "update";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (row: WorkSession, mode: SaveMode) => void;
  initial?: WorkSession | null;
  defaultDate?: string;
}

function defaultStart(anchor?: string): string {
  const d = anchor ? new Date(`${anchor}T00:00:00`) : new Date();
  d.setHours(9, 0, 0, 0);
  return toDatetimeLocal(d);
}

function defaultEnd(anchor?: string): string {
  const d = anchor ? new Date(`${anchor}T00:00:00`) : new Date();
  d.setHours(17, 0, 0, 0);
  return toDatetimeLocal(d);
}

export default function WorkSessionSheet({
  open,
  onClose,
  onSaved,
  initial,
  defaultDate,
}: Props) {
  const editing = Boolean(initial);
  const [start, setStart] = useState(
    initial ? toDatetimeLocal(initial.start_ts) : defaultStart(defaultDate),
  );
  const [end, setEnd] = useState(
    initial ? toDatetimeLocal(initial.end_ts) : defaultEnd(defaultDate),
  );
  const [workplaceId, setWorkplaceId] = useState(initial?.workplace_id ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    listWorkplaces()
      .then(setWorkplaces)
      .catch(() => setWorkplaces([]));
  }, [open]);

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
        start_ts: fromDatetimeLocal(start),
        end_ts: fromDatetimeLocal(end),
        workplace_id: workplaceId || null,
        note: note.trim() || null,
      };
      const row =
        editing && initial
          ? await updateWorkSession(initial.id, body)
          : await createWorkSession(body);
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
      title={editing ? "Ndrysho seancën" : "Shto seancë pune"}
      onClose={onClose}
    >
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <Field label="Fillimi">
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field
          label="Mbarimi"
          error={
            !ordered && start && end
              ? "Mbarimi duhet të jetë pas fillimit."
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

        <Field label="Vendi i punës (opsional)" htmlFor="work-session-workplace">
          <select
            id="work-session-workplace"
            value={workplaceId}
            onChange={(e) => setWorkplaceId(e.target.value)}
            className={inputClass}
          >
            <option value="">—</option>
            {workplaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
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
