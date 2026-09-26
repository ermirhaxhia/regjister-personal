"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/common/Field";
import { ApiError, type ClassSession, type ClassSessionInput } from "@/lib/api";
import { WEEKDAY_LABELS } from "@/lib/weekday";

const TYPE_SUGGESTIONS = ["Leksion", "Seminar", "Laborator", "Ushtrime"];

interface Props {
  initial?: ClassSession | null;
  submitLabel: string;
  onCancel?: () => void;
  onSubmit: (body: ClassSessionInput) => Promise<void>;
}

export default function SchoolSessionForm({
  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: Props) {
  const [subjectName, setSubjectName] = useState(initial?.subject_name ?? "");
  const [sessionType, setSessionType] = useState(initial?.session_type ?? "");
  const [professor, setProfessor] = useState(initial?.professor ?? "");
  const [room, setRoom] = useState(initial?.room ?? "");
  const [weekday, setWeekday] = useState(initial?.weekday ?? 0);
  const [startTime, setStartTime] = useState(
    initial?.start_time.slice(0, 5) ?? "08:00",
  );
  const [endTime, setEndTime] = useState(initial?.end_time.slice(0, 5) ?? "09:30");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timesValid = startTime !== "" && endTime !== "" && endTime > startTime;
  const valid = subjectName.trim() !== "" && timesValid;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        subject_name: subjectName.trim(),
        session_type: sessionType.trim() || null,
        professor: professor.trim() || null,
        room: room.trim() || null,
        weekday,
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
        is_active: isActive,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ruajtja dështoi.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3.5">
      <Field label="Lënda">
        <input
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          className={inputClass}
          placeholder="p.sh. Bazat e të Dhënave"
          autoFocus
        />
      </Field>

      <Field label="Lloji (opsional)" htmlFor="school-session-type">
        <input
          id="school-session-type"
          list="school-session-type-suggestions"
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value)}
          className={inputClass}
          placeholder="p.sh. Leksion"
        />
        <datalist id="school-session-type-suggestions">
          {TYPE_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Profesori (opsional)">
          <input
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            className={inputClass}
            placeholder="—"
          />
        </Field>
        <Field label="Salla (opsionale)">
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className={inputClass}
            placeholder="—"
          />
        </Field>
      </div>

      <Field label="Dita e javës" htmlFor="school-session-weekday">
        <select
          id="school-session-weekday"
          value={weekday}
          onChange={(e) => setWeekday(Number(e.target.value))}
          className={inputClass}
        >
          {WEEKDAY_LABELS.map((label, idx) => (
            <option key={idx} value={idx}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Fillimi">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </Field>
        <Field
          label="Mbarimi"
          error={
            !timesValid && startTime && endTime
              ? "Mbarimi duhet të jetë pas fillimit."
              : undefined
          }
        >
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </Field>
      </div>

      <label className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3 py-2.5">
        <span className="text-sm text-text-mid">
          {isActive ? "Aktive" : "Fikur (pa e fshirë)"}
        </span>
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 accent-accent-2"
        />
      </label>

      {error && <p className="text-[12px] text-danger">{error}</p>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-mid transition-colors hover:text-text-hi disabled:opacity-50"
          >
            Anulo
          </button>
        )}
        <button
          type="submit"
          disabled={busy || !valid}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Duke ruajtur…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
