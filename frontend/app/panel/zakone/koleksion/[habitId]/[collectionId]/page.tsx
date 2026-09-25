"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ApiError,
  getHabit,
  getCollection,
  listCollectionEntries,
  deleteCollection,
  deleteCollectionEntry,
  type Habit,
  type Collection,
  type CollectionEntry,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { todayISO, dayMonth } from "@/lib/date";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/common/States";
import Confirm from "@/components/common/Confirm";
import { IconChevronLeft, IconPlus, IconPencil, IconTrash } from "@/components/icons";
import EntrySheet from "@/components/koleksion/EntrySheet";
import EntryList from "@/components/koleksion/EntryList";
import CollectionEditSheet from "@/components/koleksion/CollectionEditSheet";

const STATUS_LABEL: Record<Collection["status"], string> = {
  active: "Aktiv",
  paused: "Në pauzë",
  finished: "Përfunduar",
};

export default function CollectionDetailPage() {
  const params = useParams<{ habitId: string; collectionId: string }>();
  const habitId = String(params.habitId);
  const collectionId = String(params.collectionId);
  const router = useRouter();

  const [habit, setHabit] = useState<Habit | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [entries, setEntries] = useState<CollectionEntry[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [lastDate, setLastDate] = useState(todayISO());
  const [toDeleteEntry, setToDeleteEntry] = useState<CollectionEntry | null>(null);
  const [confirmDeleteCollection, setConfirmDeleteCollection] = useState(false);

  const fetchAll = useCallback(
    (): Promise<[Habit, Collection, CollectionEntry[]]> =>
      Promise.all([
        getHabit(habitId),
        getCollection(collectionId),
        listCollectionEntries(collectionId),
      ]),
    [habitId, collectionId],
  );
  const applyAll = useCallback(
    ([h, c, e]: [Habit, Collection, CollectionEntry[]]) => {
      setHabit(h);
      setCollection(c);
      setEntries(e);
      if (e.length > 0) setLastDate(e[0].entry_date);
    },
    [],
  );
  const { status, reload } = useGenLoad(fetchAll, applyAll);

  const unitLabel = habit?.unit_label?.trim() || "njësi";

  const refreshCollection = useCallback(() => {
    getCollection(collectionId)
      .then(setCollection)
      .catch(() => undefined);
  }, [collectionId]);

  const onEntrySaved = useCallback(
    (row: CollectionEntry) => {
      setEntries((prev) =>
        [row, ...prev].sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1)),
      );
      setLastDate(row.entry_date);
      refreshCollection();
    },
    [refreshCollection],
  );

  const onCollectionEdited = useCallback((row: Collection) => {
    setCollection(row);
    setEditOpen(false);
  }, []);

  const confirmDeleteEntryFn = async () => {
    if (!toDeleteEntry) return;
    try {
      await deleteCollectionEntry(collectionId, toDeleteEntry.id);
      setEntries((prev) => prev.filter((e) => e.id !== toDeleteEntry.id));
      setToDeleteEntry(null);
      refreshCollection();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Fshirja dështoi");
    }
  };

  const confirmDeleteCollectionFn = async () => {
    if (!collection) return;
    try {
      await deleteCollection(collection.id);
      router.push(`/panel/zakone/koleksion/${habitId}`);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Fshirja dështoi");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-3.5 py-4 sm:px-6 sm:py-6">
      <Link
        href={`/panel/zakone/koleksion/${habitId}`}
        className="flex w-fit items-center gap-1 text-xs text-text-lo transition-colors hover:text-text-hi"
      >
        <IconChevronLeft size={14} />
        {habit ? habit.name : "Koleksione"}
      </Link>

      {status === "loading" && <LoadingBlock lines={4} />}
      {status === "error" && (
        <ErrorState message="Koleksioni nuk u ngarkua." onRetry={reload} />
      )}

      {status !== "loading" && status !== "error" && !collection && (
        <EmptyState
          title="Ky koleksion nuk u gjet"
          hint="Mund të jetë fshirë. Kthehu te lista e koleksioneve."
        />
      )}

      {collection && (
        <>
          <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <h1 className="font-display text-xl font-semibold tracking-tight text-text-hi">
                  {collection.name}
                </h1>
                <p className="text-sm text-text-mid">
                  {STATUS_LABEL[collection.status]}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  aria-label="Ndrysho koleksionin"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-lo transition-colors hover:text-text-hi"
                >
                  <IconPencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="flex h-9 items-center gap-1.5 rounded-[10px] bg-accent px-3.5 text-[12.5px] font-semibold text-bg transition-opacity hover:opacity-90"
                >
                  <IconPlus size={15} />
                  Hyrje e re
                </button>
              </div>
            </div>

            {collection.total_amount != null && collection.pct_complete != null && (
              <div className="flex flex-col gap-1.5">
                <span className="h-2 w-full overflow-hidden rounded-full bg-[#22222a]">
                  <span
                    className="block h-full rounded-full bg-accent-2"
                    style={{ width: `${collection.pct_complete}%` }}
                  />
                </span>
                <span className="font-mono text-[11px] text-text-mid">
                  {collection.amount_total} / {collection.total_amount} {unitLabel} (
                  {collection.pct_complete}%)
                </span>
              </div>
            )}
            {collection.total_amount == null && (
              <span className="font-mono text-[11px] text-text-mid">
                {collection.amount_total} {unitLabel} gjithsej
              </span>
            )}

            <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
              <Stat label="Hyrje" value={String(collection.entries_count)} />
              <Stat
                label="Ritmi"
                value={
                  collection.amount_per_day != null
                    ? `${collection.amount_per_day.toFixed(1)} ${unitLabel}/ditë`
                    : "—"
                }
              />
              <Stat
                label="Parashikim"
                value={
                  collection.estimated_finish
                    ? dayMonth(collection.estimated_finish)
                    : "—"
                }
              />
              <Stat label="Statusi" value={STATUS_LABEL[collection.status]} />
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setConfirmDeleteCollection(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[13px] text-text-lo transition-colors hover:border-danger/50 hover:text-danger"
              >
                <IconTrash size={14} />
                Fshi koleksionin
              </button>
            </div>
          </section>

          {entries.length === 0 ? (
            <EmptyState
              title="Ende pa hyrje"
              hint="Shto hyrjen e parë me butonin «Hyrje e re»."
            />
          ) : (
            <EntryList
              items={entries}
              unitLabel={unitLabel}
              onDelete={setToDeleteEntry}
            />
          )}
        </>
      )}

      <EntrySheet
        key={sheetOpen ? "open" : "closed"}
        open={sheetOpen}
        collectionId={collectionId}
        unitLabel={unitLabel}
        defaultDate={lastDate}
        onClose={() => setSheetOpen(false)}
        onSaved={onEntrySaved}
      />

      <CollectionEditSheet
        key={editOpen ? "open" : "closed"}
        open={editOpen}
        collection={collection}
        unitLabel={unitLabel}
        onClose={() => setEditOpen(false)}
        onSaved={onCollectionEdited}
      />

      <Confirm
        open={toDeleteEntry !== null}
        title="Fshi hyrjen"
        message="Do të fshihet përfundimisht kjo hyrje."
        onConfirm={confirmDeleteEntryFn}
        onCancel={() => setToDeleteEntry(null)}
      />

      <Confirm
        open={confirmDeleteCollection}
        title="Fshi koleksionin"
        message={
          collection
            ? `Do të fshihet «${collection.name}» bashkë me të gjitha hyrjet e tij.`
            : ""
        }
        onConfirm={confirmDeleteCollectionFn}
        onCancel={() => setConfirmDeleteCollection(false)}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[10px] uppercase tracking-wide text-text-lo">
        {label}
      </span>
      <span className="font-mono text-sm text-text-hi">{value}</span>
    </div>
  );
}
