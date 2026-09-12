"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listIncome,
  deleteIncome,
  listIncomeSources,
  ApiError,
  type Income,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { monthLabel } from "@/lib/date";
import { useRegisterAdd, notifyDataChanged } from "@/components/shell/ShellContext";
import PageHeader from "@/components/common/PageHeader";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/common/States";
import Confirm from "@/components/common/Confirm";
import IncomeList from "@/components/te-ardhura/IncomeList";
import IncomeSheet from "@/components/te-ardhura/IncomeSheet";

export default function IncomePage() {
  const [items, setItems] = useState<Income[]>([]);
  const [sourceNames, setSourceNames] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);
  const [toDelete, setToDelete] = useState<Income | null>(null);

  const fetchList = useCallback(() => listIncome(), []);
  const applyList = useCallback((data: Income[]) => setItems(data), []);
  const { status, reload } = useGenLoad(fetchList, applyList);

  const loadSources = useCallback(() => {
    listIncomeSources()
      .then((ss) => setSourceNames(ss.map((s) => s.name)))
      .catch(() => {});
  }, []);
  useEffect(() => {
    loadSources();
  }, [loadSources]);

  const openAdd = useCallback(() => {
    setEditing(null);
    setSheetOpen(true);
  }, []);
  useRegisterAdd("Të ardhur", openAdd);

  const onSaved = useCallback(
    (row: Income, mode: "create" | "update") => {
      sessionStorage.setItem("rp_summary_stale", "1");
      loadSources();
      if (mode === "update") {
        setItems((prev) => prev.map((r) => (r.id === row.id ? row : r)));
        return;
      }
      notifyDataChanged({ key: "income", diff: 1 });
      setItems((prev) => [row, ...prev]);
    },
    [loadSources],
  );

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteIncome(toDelete.id);
      setItems((prev) => prev.filter((r) => r.id !== toDelete.id));
      notifyDataChanged({ key: "income", diff: -1 });
      sessionStorage.setItem("rp_summary_stale", "1");
      setToDelete(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Fshirja dështoi");
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-3.5 py-4 sm:px-6 sm:py-6">
      <PageHeader title="Të ardhura" actionLabel="Të ardhur" onAction={openAdd} />

      {status === "loading" && <LoadingBlock lines={3} />}
      {status === "error" && (
        <ErrorState message="Lista nuk u ngarkua." onRetry={reload} />
      )}
      {status === "ready" && items.length === 0 && (
        <EmptyState
          title="Ende pa të ardhura"
          hint="Shto të ardhurën e parë; paga ndahet automatikisht 50/50 personale/familje."
        />
      )}
      {status === "ready" && items.length > 0 && (
        <IncomeList
          items={items}
          onEdit={(i) => {
            setEditing(i);
            setSheetOpen(true);
          }}
          onDelete={setToDelete}
        />
      )}

      <IncomeSheet
        key={sheetOpen ? (editing ? `edit-${editing.id}` : "new") : "closed"}
        open={sheetOpen}
        initial={editing}
        sources={sourceNames}
        onClose={() => setSheetOpen(false)}
        onSaved={onSaved}
      />

      <Confirm
        open={Boolean(toDelete)}
        title="Fshi të ardhurën"
        message={
          toDelete
            ? `Do të fshihet e ardhura e ${monthLabel(toDelete.period_month)} bashkë me ndarjet.`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
