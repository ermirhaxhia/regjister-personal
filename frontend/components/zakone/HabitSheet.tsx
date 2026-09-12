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
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = name.trim().length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const body = {
        name: name.trim(),
        tracking_type: trackingType,
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
            placeholder="p.sh. Lexim jashtëshkollor"
          />
        </Field>

        <Field
          label="Lloji i ndjekjes"
          htmlFor="habit-tracking-type"
          hint={
            trackingType === "binary"
              ? "Shënohet me po / jo çdo ditë."
              : "Shënohet me minuta çdo ditë."
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
          </select>
        </Field>

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
