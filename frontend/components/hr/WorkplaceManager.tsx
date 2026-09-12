"use client";

import { useCallback, useState } from "react";
import {
  ApiError,
  listWorkplaces,
  createWorkplace,
  updateWorkplace,
  deleteWorkplace,
  type Workplace,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { cn } from "@/lib/cn";
import { notifyDataChanged } from "@/components/shell/ShellContext";
import { inputClass } from "@/components/common/Field";
import { LoadingBlock, ErrorState } from "@/components/common/States";
import { IconPlus, IconPencil, IconTrash, IconCheck, IconClose } from "@/components/icons";

function countLabel(n: number): string {
  if (n === 0) return "asnjë kontakt";
  if (n === 1) return "1 kontakt";
  return `${n} kontakte`;
}

function Row({
  item,
  onRenamed,
  onDeleted,
}: {
  item: Workplace;
  onRenamed: (w: Workplace) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const next = name.trim();
    if (!next || busy) return;
    if (next === item.name) {
      setEditing(false);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const row = await updateWorkplace(item.id, { name: next });
      onRenamed(row);
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 409
            ? "Ekziston një vend me këtë emër."
            : err.message
          : "Ndryshimi dështoi.",
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      await deleteWorkplace(item.id);
      onDeleted(item.id);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Fshirja dështoi.",
      );
      setBusy(false);
    }
  };

  return (
    <li className="flex flex-col gap-1.5 border-b border-border py-3 last:border-0">
      <div className="flex items-center gap-2">
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") setEditing(false);
            }}
            className={`${inputClass} h-8 py-1`}
          />
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm text-text-hi">
            {item.name}
          </span>
        )}
        {!editing && (
          <span className="shrink-0 font-mono text-xs text-text-lo">
            {countLabel(item.contact_count)}
          </span>
        )}
        <span className="flex shrink-0 gap-1">
          {editing ? (
            <>
              <button
                type="button"
                onClick={save}
                disabled={busy}
                aria-label="Ruaj emrin"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-success disabled:opacity-50"
              >
                <IconCheck size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setName(item.name);
                }}
                aria-label="Anulo"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-text-hi"
              >
                <IconClose size={13} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label="Riemërto"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-text-hi"
              >
                <IconPencil size={13} />
              </button>
              <button
                type="button"
                onClick={remove}
                disabled={busy}
                aria-label="Fshi vendin"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-danger disabled:opacity-50"
              >
                <IconTrash size={13} />
              </button>
            </>
          )}
        </span>
      </div>
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </li>
  );
}

export default function WorkplaceManager({ bare = false }: { bare?: boolean }) {
  const [items, setItems] = useState<Workplace[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback((list: Workplace[]) => setItems(list), []);
  const { status, reload } = useGenLoad(listWorkplaces, apply);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = name.trim();
    if (!next || busy) return;
    setBusy(true);
    setError(null);
    try {
      const row = await createWorkplace({ name: next });
      setItems((prev) =>
        [...prev, row].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setName("");
      notifyDataChanged();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 409
            ? "Ekziston një vend me këtë emër."
            : err.message
          : "Shtimi dështoi.",
      );
    } finally {
      setBusy(false);
    }
  };

  const onRenamed = (w: Workplace) =>
    setItems((prev) =>
      prev
        .map((x) => (x.id === w.id ? w : x))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );

  const onDeleted = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    notifyDataChanged();
  };

  return (
    <section
      className={cn(
        "flex flex-col gap-4",
        !bare && "rounded-2xl border border-border bg-surface p-5 sm:p-6",
      )}
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-sm font-semibold text-text-hi">
          Vendet e punës
        </h2>
        <p className="text-xs text-text-lo">
          Çdo kontakt te Burime Njerëzore i takon një vendi pune.
        </p>
      </div>

      <form onSubmit={add} className="flex items-start gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="p.sh. Buzi Store"
          />
          {error && <p className="text-[11px] text-danger">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="flex h-[42px] shrink-0 items-center gap-1.5 rounded-xl bg-accent px-4 text-[13px] font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <IconPlus size={14} />
          Shto
        </button>
      </form>

      {status === "loading" && <LoadingBlock lines={2} />}
      {status === "error" && (
        <ErrorState message="Vendet nuk u ngarkuan." onRetry={reload} />
      )}
      {(status === "ready" || status === "refreshing") &&
        (items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface-2/30 px-4 py-6 text-center text-xs text-text-lo">
            Ende pa vende pune. Shto të parin lart.
          </p>
        ) : (
          <ul className="flex flex-col">
            {items.map((w) => (
              <Row
                key={w.id}
                item={w}
                onRenamed={onRenamed}
                onDeleted={onDeleted}
              />
            ))}
          </ul>
        ))}
    </section>
  );
}
