"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  getFitnessSummary,
  listActivityTypes,
  listFitnessEntries,
  listUnits,
  deleteFitnessEntry,
  ApiError,
  type ActivityType,
  type ActivityUnit,
  type FitnessEntry,
  type FitnessSummary,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { fullDate } from "@/lib/date";
import { notifyDataChanged } from "@/components/shell/ShellContext";
import PageHeader from "@/components/common/PageHeader";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/common/States";
import Confirm from "@/components/common/Confirm";
import ActivityCard from "@/components/aktivitet/ActivityCard";
import EntriesTable from "@/components/aktivitet/EntriesTable";
import EntryModal from "@/components/aktivitet/EntryModal";

type Loaded = [FitnessSummary, ActivityType[], FitnessEntry[], ActivityUnit[]];

export default function FitnessPage() {
  const [summary, setSummary] = useState<FitnessSummary | null>(null);
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [entries, setEntries] = useState<FitnessEntry[]>([]);
  const [units, setUnits] = useState<ActivityUnit[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ActivityType | null>(null);
  const [editing, setEditing] = useState<FitnessEntry | null>(null);
  const [toDelete, setToDelete] = useState<FitnessEntry | null>(null);

  const fetchAll = useCallback(
    (): Promise<Loaded> =>
      Promise.all([
        getFitnessSummary(30),
        listActivityTypes(),
        listFitnessEntries(),
        listUnits(),
      ]),
    [],
  );
  const applyAll = useCallback(([s, t, e, u]: Loaded) => {
    setSummary(s);
    setTypes(t);
    setEntries(e);
    setUnits(u);
  }, []);
  const { status, reload } = useGenLoad(fetchAll, applyAll);

  const refreshSummary = useCallback(() => {
    getFitnessSummary(30)
      .then(setSummary)
      .catch(() => undefined);
  }, []);

  const openAdd = useCallback((type: ActivityType) => {
    setEditing(null);
    setModalType(type);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback(
    (e: FitnessEntry) => {
      setEditing(e);
      setModalType(types.find((t) => t.id === e.activity_type_id) ?? null);
      setModalOpen(true);
    },
    [types],
  );

  const onSaved = useCallback(
    (row: FitnessEntry, mode: "create" | "update") => {
      if (mode === "update") {
        setEntries((prev) => prev.map((r) => (r.id === row.id ? row : r)));
      } else {
        setEntries((prev) => [row, ...prev]);
        notifyDataChanged({ key: "fitness", diff: 1 });
      }
      refreshSummary();
    },
    [refreshSummary],
  );

  const confirmDelete = useCallback(async () => {
    if (!toDelete) return;
    try {
      await deleteFitnessEntry(toDelete.id);
      setEntries((prev) => prev.filter((r) => r.id !== toDelete.id));
      notifyDataChanged({ key: "fitness", diff: -1 });
      setToDelete(null);
      refreshSummary();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Fshirja dështoi");
    }
  }, [toDelete, refreshSummary]);

  const goalMap = useMemo(
    () => new Map((summary?.goals ?? []).map((g) => [g.activity_type_id, g])),
    [summary],
  );
  const entriesByType = useMemo(() => {
    const m = new Map<string, FitnessEntry[]>();
    for (const e of entries) {
      const list = m.get(e.activity_type_id);
      if (list) list.push(e);
      else m.set(e.activity_type_id, [e]);
    }
    return m;
  }, [entries]);

  const ready = status === "ready" || status === "refreshing";

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-3.5 py-4 sm:px-6 sm:py-6">
      <PageHeader title="Aktivitet Fizik" />

      {status === "loading" && <LoadingBlock lines={5} />}
      {status === "error" && (
        <ErrorState message="Të dhënat nuk u ngarkuan." onRetry={reload} />
      )}

      {ready && types.length === 0 && (
        <EmptyState
          title="Ende pa lloje aktiviteti"
          hint="Krijo llojet e para (p.sh. Ecje, Vrapim) me njësitë e tyre te Cilësimet, pastaj shëno hyrjet këtu."
          action={
            <Link
              href="/panel/cilesime"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
            >
              Krijo te Cilësimet
            </Link>
          }
        />
      )}

      {ready && types.length > 0 && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {types.map((t) => (
              <ActivityCard
                key={t.id}
                type={t}
                goal={goalMap.get(t.id)}
                entries={entriesByType.get(t.id) ?? []}
                onAdd={() => openAdd(t)}
              />
            ))}
          </section>

          {entries.length > 0 ? (
            <EntriesTable
              items={entries}
              onEdit={openEdit}
              onDelete={setToDelete}
            />
          ) : (
            <EmptyState
              title="Asnjë hyrje ende"
              hint="Kliko një kartë lart për të shtuar aktivitetin e parë."
            />
          )}
        </>
      )}

      <EntryModal
        key={editing?.id ?? modalType?.id ?? "new"}
        open={modalOpen}
        activityType={modalType}
        units={units}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSaved={onSaved}
      />

      <Confirm
        open={Boolean(toDelete)}
        title="Fshi hyrjen"
        message={
          toDelete
            ? `Do të fshihet hyrja e ${fullDate(toDelete.entry_date)}${
                toDelete.activity_type_name
                  ? ` · ${toDelete.activity_type_name}`
                  : ""
              }.`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
