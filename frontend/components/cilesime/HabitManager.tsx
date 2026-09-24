"use client";

import { useCallback, useState } from "react";
import {
  ApiError,
  listHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  type Habit,
  type HabitTrackingType,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { cn } from "@/lib/cn";
import { notifyDataChanged } from "@/components/shell/ShellContext";
import { Field, inputClass } from "@/components/common/Field";
import { LoadingBlock, ErrorState } from "@/components/common/States";
import Confirm from "@/components/common/Confirm";
import HabitSheet from "@/components/zakone/HabitSheet";
import ArchivedHabits from "@/components/zakone/ArchivedHabits";
import { IconPlus, IconPencil } from "@/components/icons";

const TYPE_LABEL: Record<HabitTrackingType, string> = {
  binary: "po / jo",
  duration: "minuta",
  lexim: "lexim",
};

const byName = (list: Habit[]): Habit[] =>
  [...list].sort((a, b) => a.name.localeCompare(b.name));

function ActiveRow({
  item,
  onEdit,
  onArchive,
}: {
  item: Habit;
  onEdit: (h: Habit) => void;
  onArchive: (h: Habit) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const archive = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await onArchive(item);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Arkivimi dështoi.");
      setBusy(false);
    }
  };

  return (
    <li className="flex flex-col gap-1.5 border-b border-border py-3 last:border-0">
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-sm text-text-hi">
          {item.name}
        </span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-text-lo">
          {TYPE_LABEL[item.tracking_type]}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label={`Riemërto ${item.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-text-hi"
          >
            <IconPencil size={13} />
          </button>
          <button
            type="button"
            onClick={archive}
            disabled={busy}
            className="rounded-md border border-border px-2.5 py-1 text-[11px] text-text-mid transition-colors hover:border-accent-2/50 hover:text-text-hi disabled:opacity-50"
          >
            Arkivo
          </button>
        </span>
      </div>
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </li>
  );
}

export default function HabitManager({ bare = false }: { bare?: boolean }) {
  const [active, setActive] = useState<Habit[]>([]);
  const [archived, setArchived] = useState<Habit[]>([]);
  const [name, setName] = useState("");
  const [trackingType, setTrackingType] = useState<HabitTrackingType>("binary");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [toDelete, setToDelete] = useState<Habit | null>(null);

  const fetchAll = useCallback(
    (): Promise<[Habit[], Habit[]]> =>
      Promise.all([listHabits(true), listHabits(false)]),
    [],
  );
  const applyAll = useCallback(([a, arch]: [Habit[], Habit[]]) => {
    setActive(byName(a));
    setArchived(byName(arch));
  }, []);
  const { status, reload, refresh } = useGenLoad(fetchAll, applyAll);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = name.trim();
    if (!next || busy) return;
    setBusy(true);
    setError(null);
    try {
      const row = await createHabit({ name: next, tracking_type: trackingType });
      setActive((prev) => byName([...prev, row]));
      setName("");
      setTrackingType("binary");
      notifyDataChanged({ key: "habits", diff: 1 });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 409
            ? "Ekziston një zakon me këtë emër."
            : err.message
          : "Shtimi dështoi.",
      );
    } finally {
      setBusy(false);
    }
  };

  const archiveHabit = async (h: Habit) => {
    const row = await updateHabit(h.id, { is_active: false });
    setActive((prev) => prev.filter((x) => x.id !== h.id));
    setArchived((prev) => byName([...prev, row]));
  };

  const reactivate = async (h: Habit) => {
    try {
      const row = await updateHabit(h.id, { is_active: true });
      setArchived((prev) => prev.filter((x) => x.id !== h.id));
      setActive((prev) => byName([...prev, row]));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Ri-aktivizimi dështoi.");
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteHabit(toDelete.id);
      setArchived((prev) => prev.filter((x) => x.id !== toDelete.id));
      notifyDataChanged({ key: "habits", diff: -1 });
      setToDelete(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Fshirja dështoi.");
    }
  };

  const onSaved = useCallback(() => {
    setEditing(null);
    refresh();
  }, [refresh]);

  const ready = status === "ready" || status === "refreshing";

  return (
    <section
      className={cn(
        "flex flex-col gap-4",
        !bare && "rounded-2xl border border-border bg-surface p-5 sm:p-6",
      )}
    >
      <p className="text-xs text-text-lo">
        Zakonet aktive dalin te tabela ditore te «Zakone». Këtu i shton, i
        riemërton dhe i arkivon.
      </p>

      <form onSubmit={add} className="flex flex-col gap-3">
        <Field label="Emri i zakonit të ri">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="p.sh. Lexim"
          />
        </Field>
        <Field
          label="Lloji i ndjekjes"
          htmlFor="new-habit-tracking-type"
          hint={
            trackingType === "binary"
              ? "Shënohet me po / jo çdo ditë."
              : trackingType === "duration"
                ? "Shënohet me minuta çdo ditë."
                : "Hap një faqe të veçantë për të menaxhuar librat dhe sesionet e leximit."
          }
        >
          <select
            id="new-habit-tracking-type"
            value={trackingType}
            onChange={(e) =>
              setTrackingType(e.target.value as HabitTrackingType)
            }
            className={inputClass}
          >
            <option value="binary">Binar (po / jo)</option>
            <option value="duration">Kohëzgjatje (minuta)</option>
            <option value="lexim">Lexim (libra)</option>
          </select>
        </Field>
        {error && <p className="text-[11px] text-danger">{error}</p>}
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="flex h-[42px] items-center justify-center gap-1.5 rounded-xl bg-accent px-4 text-[13px] font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <IconPlus size={14} />
          Shto zakon
        </button>
      </form>

      {status === "loading" && <LoadingBlock lines={2} />}
      {status === "error" && (
        <ErrorState message="Zakonet nuk u ngarkuan." onRetry={reload} />
      )}

      {ready && (
        <>
          {active.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-surface-2/30 px-4 py-6 text-center text-xs text-text-lo">
              Ende pa zakone aktive. Shto të parin lart.
            </p>
          ) : (
            <ul className="flex flex-col">
              {active.map((h) => (
                <ActiveRow
                  key={h.id}
                  item={h}
                  onEdit={setEditing}
                  onArchive={archiveHabit}
                />
              ))}
            </ul>
          )}

          <ArchivedHabits
            items={archived}
            onReactivate={reactivate}
            onDelete={setToDelete}
          />
        </>
      )}

      <HabitSheet
        key={editing?.id ?? "none"}
        open={editing !== null}
        initial={editing}
        onClose={() => setEditing(null)}
        onSaved={onSaved}
      />

      <Confirm
        open={toDelete !== null}
        title="Fshi zakonin"
        message={
          toDelete
            ? `Do të fshihet «${toDelete.name}» bashkë me të gjitha hyrjet e tij.`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
