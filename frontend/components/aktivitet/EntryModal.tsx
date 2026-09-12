"use client";

import { useMemo, useState } from "react";
import Sheet from "@/components/common/Sheet";
import { Field, SubmitRow, inputClass } from "@/components/common/Field";
import { fullDate, todayISO } from "@/lib/date";
import {
  ApiError,
  createFitnessEntry,
  updateFitnessEntry,
  type ActivityType,
  type ActivityUnit,
  type FitnessEntry,
} from "@/lib/api";

type SaveMode = "create" | "update";

interface Props {
  open: boolean;
  activityType: ActivityType | null;
  units: ActivityUnit[];
  initial?: FitnessEntry | null;
  onClose: () => void;
  onSaved: (row: FitnessEntry, mode: SaveMode) => void;
}

function badValue(raw: string): boolean {
  const v = raw.trim().replace(",", ".");
  if (v === "") return false;
  const n = Number(v);
  return !Number.isFinite(n) || n <= 0;
}

export default function EntryModal({
  open,
  activityType,
  units,
  initial,
  onClose,
  onSaved,
}: Props) {
  const editing = Boolean(initial);
  const unitMap = useMemo(() => new Map(units.map((u) => [u.key, u])), [units]);
  const unitKeys = useMemo(() => activityType?.units ?? [], [activityType]);

  const [values, setValues] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    if (initial) {
      for (const [k, v] of Object.entries(initial.values)) out[k] = String(v);
    }
    return out;
  });
  const [date, setDate] = useState(initial?.entry_date ?? todayISO());
  const [note, setNote] = useState(initial?.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxDate = todayISO();

  const parsed = useMemo(() => {
    const out: Record<string, number> = {};
    for (const key of unitKeys) {
      const raw = (values[key] ?? "").trim().replace(",", ".");
      if (raw === "") continue;
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) out[key] = n;
    }
    return out;
  }, [unitKeys, values]);

  const anyBad = unitKeys.some((key) => badValue(values[key] ?? ""));
  const valid =
    activityType != null &&
    !anyBad &&
    Object.keys(parsed).length > 0 &&
    date !== "" &&
    date <= maxDate;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy || !activityType) return;
    setBusy(true);
    setError(null);
    try {
      const row =
        editing && initial
          ? await updateFitnessEntry(initial.id, {
              values: parsed,
              note: note.trim() || null,
            })
          : await createFitnessEntry({
              activity_type_id: activityType.id,
              values: parsed,
              entry_date: date,
              note: note.trim() || null,
            });
      onSaved(row, editing ? "update" : "create");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ruajtja dështoi");
    } finally {
      setBusy(false);
    }
  };

  const name = activityType?.name ?? "";
  const title = editing ? `Ndrysho — ${name}` : `Shto — ${name}`;

  return (
    <Sheet open={open} title={title} onClose={onClose}>
      {!activityType ? (
        <p className="text-sm text-text-mid">
          Ky lloj aktiviteti nuk u gjet më. Rifresko faqen dhe provo sërish.
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div
            className={
              unitKeys.length === 1
                ? "grid grid-cols-1 gap-3"
                : "grid grid-cols-2 gap-3"
            }
          >
            {unitKeys.map((key) => {
              const meta = unitMap.get(key);
              const decimal = meta?.decimal ?? false;
              const bad = badValue(values[key] ?? "");
              return (
                <Field
                  key={key}
                  label={meta?.label ?? key}
                  error={bad ? "Duhet numër > 0" : undefined}
                >
                  <input
                    type="number"
                    inputMode={decimal ? "decimal" : "numeric"}
                    min="0"
                    step={decimal ? "0.01" : "1"}
                    value={values[key] ?? ""}
                    onChange={(ev) =>
                      setValues((v) => ({ ...v, [key]: ev.target.value }))
                    }
                    className={inputClass}
                    placeholder="0"
                  />
                </Field>
              );
            })}
          </div>

          {editing ? (
            <p className="font-mono text-[11px] text-text-lo">{fullDate(date)}</p>
          ) : (
            <Field label="Data">
              <input
                type="date"
                max={maxDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </Field>
          )}

          <Field label="Shënim (opsional)">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="—"
            />
          </Field>

          <SubmitRow
            busy={busy}
            disabled={!valid}
            error={error}
            onCancel={onClose}
            submitLabel={editing ? "Ruaj" : "Shto"}
          />
        </form>
      )}
    </Sheet>
  );
}
