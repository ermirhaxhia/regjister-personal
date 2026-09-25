"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ApiError,
  getHabit,
  listCollections,
  deleteCollection,
  type Habit,
  type Collection,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { useRegisterAdd } from "@/components/shell/ShellContext";
import PageHeader from "@/components/common/PageHeader";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/common/States";
import Confirm from "@/components/common/Confirm";
import { IconChevronLeft } from "@/components/icons";
import CollectionCard from "@/components/koleksion/CollectionCard";
import CollectionForm from "@/components/koleksion/CollectionForm";
import CollectionEditSheet from "@/components/koleksion/CollectionEditSheet";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-lo">
      {children}
    </h2>
  );
}

export default function HabitCollectionsPage() {
  const params = useParams<{ habitId: string }>();
  const habitId = String(params.habitId);

  const [habit, setHabit] = useState<Habit | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [toDelete, setToDelete] = useState<Collection | null>(null);

  const fetchAll = useCallback(
    (): Promise<[Habit, Collection[]]> =>
      Promise.all([getHabit(habitId), listCollections(habitId)]),
    [habitId],
  );
  const applyAll = useCallback(([h, c]: [Habit, Collection[]]) => {
    setHabit(h);
    setCollections(c);
  }, []);
  const { status, reload } = useGenLoad(fetchAll, applyAll);

  const unitLabel = habit?.unit_label?.trim() || "njësi";

  const active = useMemo(
    () => collections.filter((c) => c.status === "active"),
    [collections],
  );
  const paused = useMemo(
    () => collections.filter((c) => c.status === "paused"),
    [collections],
  );
  const finished = useMemo(
    () => collections.filter((c) => c.status === "finished"),
    [collections],
  );

  const onCreated = useCallback((row: Collection) => {
    setCollections((prev) => [row, ...prev]);
  }, []);

  const onUpdated = useCallback((row: Collection) => {
    setCollections((prev) => prev.map((c) => (c.id === row.id ? row : c)));
    setEditing(null);
  }, []);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteCollection(toDelete.id);
      setCollections((prev) => prev.filter((c) => c.id !== toDelete.id));
      setToDelete(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Fshirja dështoi");
    }
  };

  const openAdd = useCallback(() => setAddOpen(true), []);
  useRegisterAdd("Koleksion i ri", openAdd);

  const ready = status === "ready" || status === "refreshing";

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-3.5 py-4 sm:px-6 sm:py-6">
      <Link
        href="/panel/zakone"
        className="flex w-fit items-center gap-1 text-xs text-text-lo transition-colors hover:text-text-hi"
      >
        <IconChevronLeft size={14} />
        Zakone
      </Link>

      <PageHeader
        title={habit ? habit.name : "Koleksion"}
        actionLabel="Koleksion i ri"
        onAction={openAdd}
      />

      {status === "loading" && <LoadingBlock lines={4} />}
      {status === "error" && (
        <ErrorState message="Koleksionet nuk u ngarkuan." onRetry={reload} />
      )}

      {ready && collections.length === 0 && (
        <EmptyState
          title="Ende pa koleksione"
          hint={`Shto të parin për të nisur ndjekjen e progresit në ${unitLabel}.`}
          action={
            <button
              type="button"
              onClick={openAdd}
              className="rounded-lg border border-border px-4 py-2 text-sm text-text-mid transition-colors hover:text-text-hi"
            >
              Shto koleksionin e parë
            </button>
          }
        />
      )}

      {ready && active.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionTitle>Aktive</SectionTitle>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((c) => (
              <CollectionCard
                key={c.id}
                habitId={habitId}
                collection={c}
                unitLabel={unitLabel}
                onEdit={setEditing}
                onDelete={setToDelete}
              />
            ))}
          </div>
        </div>
      )}

      {ready && paused.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionTitle>Në pauzë</SectionTitle>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paused.map((c) => (
              <CollectionCard
                key={c.id}
                habitId={habitId}
                collection={c}
                unitLabel={unitLabel}
                onEdit={setEditing}
                onDelete={setToDelete}
              />
            ))}
          </div>
        </div>
      )}

      {ready && finished.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionTitle>Të përfunduara</SectionTitle>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {finished.map((c) => (
              <CollectionCard
                key={c.id}
                habitId={habitId}
                collection={c}
                unitLabel={unitLabel}
                onEdit={setEditing}
                onDelete={setToDelete}
              />
            ))}
          </div>
        </div>
      )}

      <CollectionForm
        open={addOpen}
        habitId={habitId}
        unitLabel={unitLabel}
        onClose={() => setAddOpen(false)}
        onSaved={onCreated}
      />

      <CollectionEditSheet
        key={editing?.id ?? "none"}
        open={editing !== null}
        collection={editing}
        unitLabel={unitLabel}
        onClose={() => setEditing(null)}
        onSaved={onUpdated}
      />

      <Confirm
        open={toDelete !== null}
        title="Fshi koleksionin"
        message={
          toDelete
            ? `Do të fshihet «${toDelete.name}» bashkë me të gjitha hyrjet e tij.`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
