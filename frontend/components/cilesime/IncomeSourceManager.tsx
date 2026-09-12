"use client";

import { useCallback, useRef, useState } from "react";
import {
  ApiError,
  listIncomeSources,
  createIncomeSource,
  updateIncomeSource,
  deleteIncomeSource,
  type IncomeSource,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { cn } from "@/lib/cn";
import { Field, inputClass } from "@/components/common/Field";
import { LoadingBlock, ErrorState } from "@/components/common/States";
import Confirm from "@/components/common/Confirm";
import { IconPlus, IconPencil, IconTrash } from "@/components/icons";

function countLabel(n: number): string {
  if (n <= 0) return "";
  return n === 1 ? "1 e ardhur" : `${n} të ardhura`;
}

function deleteMessage(s: IncomeSource): string {
  if (s.income_count > 0) {
    const verb = s.income_count === 1 ? "e ka" : "e kanë";
    return `«${s.name}» — ${countLabel(s.income_count)} ${verb} këtë burim. Ato mbeten, por burimi s'do të jetë më në listë.`;
  }
  return `Do të fshihet burimi «${s.name}».`;
}

function Row({
  item,
  onRenamed,
  onAskDelete,
}: {
  item: IncomeSource;
  onRenamed: (s: IncomeSource) => void;
  onAskDelete: (s: IncomeSource) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skipBlur = useRef(false);

  const save = async () => {
    if (skipBlur.current) {
      skipBlur.current = false;
      return;
    }
    const next = name.trim();
    if (busy) return;
    if (!next || next === item.name) {
      skipBlur.current = true;
      setEditing(false);
      setName(item.name);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const row = await updateIncomeSource(item.id, next);
      skipBlur.current = true;
      onRenamed(row);
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 409
            ? "Ekziston një burim me këtë emër."
            : err.message
          : "Ndryshimi dështoi.",
      );
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    skipBlur.current = true;
    setEditing(false);
    setName(item.name);
    setError(null);
  };

  return (
    <li className="flex flex-col gap-1.5 border-b border-border py-3 last:border-0">
      <div className="flex items-center gap-2">
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                save();
              } else if (e.key === "Escape") {
                cancel();
              }
            }}
            className={`${inputClass} h-8 py-1`}
          />
        ) : (
          <>
            <span className="min-w-0 flex-1 truncate text-sm text-text-hi">
              {item.name}
            </span>
            {countLabel(item.income_count) && (
              <span className="shrink-0 font-mono text-xs text-text-lo">
                {countLabel(item.income_count)}
              </span>
            )}
            <span className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => {
                  skipBlur.current = false;
                  setName(item.name);
                  setError(null);
                  setEditing(true);
                }}
                aria-label={`Riemërto ${item.name}`}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-text-hi"
              >
                <IconPencil size={13} />
              </button>
              <button
                type="button"
                onClick={() => onAskDelete(item)}
                aria-label={`Fshi ${item.name}`}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-danger"
              >
                <IconTrash size={13} />
              </button>
            </span>
          </>
        )}
      </div>
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </li>
  );
}

export default function IncomeSourceManager({
  bare = false,
}: {
  bare?: boolean;
}) {
  const [items, setItems] = useState<IncomeSource[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<IncomeSource | null>(null);

  const apply = useCallback((list: IncomeSource[]) => setItems(list), []);
  const { status, reload } = useGenLoad(listIncomeSources, apply);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = name.trim();
    if (!next || busy) return;
    setBusy(true);
    setError(null);
    try {
      const row = await createIncomeSource(next);
      setItems((prev) => [...prev, row]);
      setName("");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 409
            ? "Ekziston një burim me këtë emër."
            : err.message
          : "Shtimi dështoi.",
      );
    } finally {
      setBusy(false);
    }
  };

  const onRenamed = (s: IncomeSource) =>
    setItems((prev) => prev.map((x) => (x.id === s.id ? s : x)));

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteIncomeSource(toDelete.id);
      setItems((prev) => prev.filter((x) => x.id !== toDelete.id));
      setToDelete(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Fshirja dështoi.");
    }
  };

  const ready = status === "ready" || status === "refreshing";

  return (
    <section
      className={cn(
        "flex flex-col gap-4",
        !bare && "rounded-2xl border border-border bg-surface p-5 sm:p-6",
      )}
    >
      <p className="text-xs text-text-lo">
        Burimet dalin te dropdown-i kur shton një të ardhur. Riemërtimi
        përditëson edhe të ardhurat ekzistuese.
      </p>

      <form onSubmit={add} className="flex flex-col gap-3">
        <Field label="Emri i burimit">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="p.sh. Paga"
          />
        </Field>
        {error && <p className="text-[11px] text-danger">{error}</p>}
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="flex h-[42px] items-center justify-center gap-1.5 rounded-xl bg-accent px-4 text-[13px] font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <IconPlus size={14} />
          Shto
        </button>
      </form>

      {status === "loading" && <LoadingBlock lines={2} />}
      {status === "error" && (
        <ErrorState message="Burimet nuk u ngarkuan." onRetry={reload} />
      )}
      {ready &&
        (items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface-2/30 px-4 py-6 text-center text-xs text-text-lo">
            Ende pa burime. Shto të parën lart.
          </p>
        ) : (
          <ul className="flex flex-col">
            {items.map((s) => (
              <Row
                key={s.id}
                item={s}
                onRenamed={onRenamed}
                onAskDelete={setToDelete}
              />
            ))}
          </ul>
        ))}

      <Confirm
        open={toDelete !== null}
        title="Fshi burimin"
        message={toDelete ? deleteMessage(toDelete) : ""}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
