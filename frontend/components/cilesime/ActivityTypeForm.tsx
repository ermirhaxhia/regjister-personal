"use client";

import { useMemo, useState } from "react";
import { Field, inputClass } from "@/components/common/Field";
import {
  ApiError,
  type ActivityType,
  type ActivityTypeInput,
  type ActivityUnit,
} from "@/lib/api";
import UnitPicker from "@/components/cilesime/UnitPicker";

interface Props {
  units: ActivityUnit[];
  initial?: ActivityType | null;
  submitLabel: string;
  onCancel?: () => void;
  onSubmit: (body: ActivityTypeInput) => Promise<void>;
}

export default function ActivityTypeForm({
  units,
  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [selected, setSelected] = useState<string[]>(initial?.units ?? []);
  const [goal, setGoal] = useState(
    initial?.daily_goal != null ? String(initial.daily_goal) : "",
  );
  const [goalUnit, setGoalUnit] = useState(initial?.goal_unit ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goalNum = Number(goal.trim().replace(",", "."));
  const goalActive =
    goal.trim() !== "" && Number.isFinite(goalNum) && goalNum > 0;
  const goalUnitValid =
    !goalActive || (goalUnit !== "" && selected.includes(goalUnit));
  const valid = name.trim() !== "" && selected.length > 0 && goalUnitValid;

  const chosenUnits = useMemo(
    () => units.filter((u) => selected.includes(u.key)),
    [units, selected],
  );

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key];
      if (!next.includes(goalUnit)) setGoalUnit("");
      return next;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        units: selected,
        daily_goal: goalActive ? goalNum : null,
        goal_unit: goalActive ? goalUnit : null,
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 409
            ? "Ekziston një lloj me këtë emër."
            : err.message
          : "Ruajtja dështoi.",
      );
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3.5">
      <Field label="Emri">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="p.sh. Ecje"
          autoFocus
        />
      </Field>

      <Field label="Njësitë matëse">
        <UnitPicker units={units} selected={selected} onToggle={toggle} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Synim ditor (opsional)">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className={inputClass}
            placeholder="—"
          />
        </Field>
        <Field label="Njësia e synimit">
          <select
            value={goalUnit}
            onChange={(e) => setGoalUnit(e.target.value)}
            disabled={!goalActive || chosenUnits.length === 0}
            className={`${inputClass} disabled:opacity-50`}
          >
            <option value="">—</option>
            {chosenUnits.map((u) => (
              <option key={u.key} value={u.key}>
                {u.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

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
