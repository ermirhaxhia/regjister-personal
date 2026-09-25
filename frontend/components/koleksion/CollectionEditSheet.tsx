"use client";

import { useState } from "react";
import Sheet from "@/components/common/Sheet";
import { Field, SubmitRow, inputClass } from "@/components/common/Field";
import {
  ApiError,
  updateCollection,
  type Collection,
  type CollectionStatus,
} from "@/lib/api";

interface Props {
  open: boolean;
  collection: Collection | null;
  unitLabel: string;
  onClose: () => void;
  onSaved: (row: Collection) => void;
}

const STATUS_LABEL: Record<CollectionStatus, string> = {
  active: "Aktiv",
  paused: "Në pauzë",
  finished: "Përfunduar",
};

export default function CollectionEditSheet({
  open,
  collection,
  unitLabel,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState(collection?.name ?? "");
  const [total, setTotal] = useState(
    collection?.total_amount != null ? String(collection.total_amount) : "",
  );
  const [status, setStatus] = useState<CollectionStatus>(
    collection?.status ?? "active",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalNum = total.trim() ? Number(total) : null;
  const valid =
    name.trim().length > 0 &&
    (totalNum == null || (Number.isFinite(totalNum) && totalNum > 0));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy || !collection) return;
    setBusy(true);
    setError(null);
    try {
      const row = await updateCollection(collection.id, {
        name: name.trim(),
        total_amount: totalNum,
        status,
      });
      onSaved(row);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ruajtja dështoi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} title="Ndrysho koleksionin" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <Field label="Emri">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
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

        <Field label="Statusi" htmlFor="collection-status">
          <select
            id="collection-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as CollectionStatus)}
            className={inputClass}
          >
            {(Object.keys(STATUS_LABEL) as CollectionStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>

        <SubmitRow
          busy={busy}
          error={error}
          onCancel={onClose}
          submitLabel="Ruaj"
          disabled={!valid}
        />
      </form>
    </Sheet>
  );
}
