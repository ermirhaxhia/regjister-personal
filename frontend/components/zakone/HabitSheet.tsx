"use client";

import { useState } from "react";
import Sheet from "@/components/common/Sheet";
import { Field, SubmitRow, inputClass } from "@/components/common/Field";
import {
  ApiError,
  createHabit,
  updateHabit,
  type Habit,
  type HabitTrackingType,
} from "@/lib/api";

type SaveMode = "create" | "update";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (row: Habit, mode: SaveMode) => void;
  initial?: Habit | null;
}

export default function HabitSheet({ open, onClose, onSaved, initial }: Props) {
  const editing = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? "");
  const [trackingType, setTrackingType] = useState<HabitTrackingType>(
    initial?.tracking_type ?? "binary",
  );
  const [unitLabel, setUnitLabel] = useState(initial?.unit_label ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unitLabelRequired =
    trackingType === "koleksion" || trackingType === "numer";
  const unitLabelValid = !unitLabelRequired || unitLabel.trim().length > 0;
  const valid = name.trim().length > 0 && unitLabelValid;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const body = {
        name: name.trim(),
        tracking_type: trackingType,
        unit_label: unitLabelRequired ? unitLabel.trim() : null,
        is_active: isActive,
      };
      const row =
        editing && initial
          ? await updateHabit(initial.id, body)
          : await createHabit(body);
      onSaved(row, editing ? "update" : "create");
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 409
            ? "Ekziston një zakon me këtë emër."
            : err.status >= 500
              ? "Gabim serveri, provo përsëri."
              : err.status === 0
                ? "S'u lidh dot me serverin."
                : err.message,
        );
      } else {
        setError("Ruajtja dështoi.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={open}
      title={editing ? "Ndrysho zakonin" : "Shto zakon"}
      onClose={onClose}
    >
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <Field label="Emri">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="p.sh. Palestër"
          />
        </Field>

        <Field
          label="Lloji i ndjekjes"
          htmlFor="habit-tracking-type"
          hint={
            trackingType === "binary"
              ? "Shënohet me po / jo çdo ditë."
              : trackingType === "duration"
                ? "Shënohet me minuta çdo ditë."
                : trackingType === "numer"
                  ? "Shënohet me një numër (p.sh. sasi) çdo ditë."
                  : "Hap një faqe të veçantë për të menaxhuar koleksione progresi (libra, ushtrime, projekte etj.)."
          }
        >
          <select
            id="habit-tracking-type"
            value={trackingType}
            onChange={(e) =>
              setTrackingType(e.target.value as HabitTrackingType)
            }
            className={inputClass}
          >
            <option value="binary">Binar (po / jo)</option>
            <option value="duration">Kohëzgjatje (minuta)</option>
            <option value="numer">Numër (sasi)</option>
            <option value="koleksion">Koleksion (progres)</option>
          </select>
        </Field>

        {unitLabelRequired && (
          <Field label="Emri i njësisë" hint='p.sh. "faqe", "ushtrime", "kapituj"'>
            <input
              value={unitLabel}
              onChange={(e) => setUnitLabel(e.target.value)}
              className={inputClass}
              placeholder="p.sh. faqe"
            />
          </Field>
        )}

        <label className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3 py-2.5">
          <span className="text-sm text-text-mid">
            {isActive ? "Aktiv" : "Arkivuar"}
          </span>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-accent-2"
          />
        </label>

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
