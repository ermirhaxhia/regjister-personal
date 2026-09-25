"use client";

import { useState } from "react";
import Sheet from "@/components/common/Sheet";
import { Field, SubmitRow, inputClass } from "@/components/common/Field";
import { ApiError, createCollection, type Collection } from "@/lib/api";

interface Props {
  open: boolean;
  habitId: string;
  unitLabel: string;
  onClose: () => void;
  onSaved: (row: Collection) => void;
}

export default function CollectionForm({
  open,
  habitId,
  unitLabel,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState("");
  const [total, setTotal] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalNum = total.trim() ? Number(total) : null;
  const valid =
    name.trim().length > 0 &&
    (totalNum == null || (Number.isFinite(totalNum) && totalNum > 0));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const row = await createCollection(habitId, {
        name: name.trim(),
        total_amount: totalNum,
      });
      onSaved(row);
      setName("");
      setTotal("");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ruajtja dështoi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} title="Koleksion i ri" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <Field label="Emri">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="p.sh. Kështjella"
          />
        </Field>

        <Field label={`Sa gjithsej (opsional, ${unitLabel})`}>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
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
