"use client";

import { useCallback, useState } from "react";
import {
  listWorkSessions,
  deleteWorkSession,
  ApiError,
  type WorkSession,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { fullDate } from "@/lib/date";
import { useRegisterAdd, notifyDataChanged } from "@/components/shell/ShellContext";
import PageHeader from "@/components/common/PageHeader";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/common/States";
import Confirm from "@/components/common/Confirm";
import WorkSessionList from "@/components/ore-pune/WorkSessionRow";
import WorkSessionSheet from "@/components/ore-pune/WorkSessionSheet";
import WorkSummaryStrip from "@/components/ore-pune/WorkSummaryStrip";

export default function WorkSessionsPage() {
  const [items, setItems] = useState<WorkSession[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<WorkSession | null>(null);
  const [toDelete, setToDelete] = useState<WorkSession | null>(null);

  const fetchList = useCallback(() => listWorkSessions(), []);
  const applyList = useCallback((data: WorkSession[]) => setItems(data), []);
  const { status, reload } = useGenLoad(fetchList, applyList);

  const openAdd = useCallback(() => {
    setEditing(null);
    setSheetOpen(true);
  }, []);
  useRegisterAdd("Shto seancë pune", openAdd);

  const onSaved = useCallback((row: WorkSession, mode: "create" | "update") => {
    if (mode === "update") {
      setItems((prev) => prev.map((r) => (r.id === row.id ? row : r)));
      return;
    }
    notifyDataChanged();
    setItems((prev) => [row, ...prev]);
  }, []);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteWorkSession(toDelete.id);
      setItems((prev) => prev.filter((r) => r.id !== toDelete.id));
      notifyDataChanged();
      setToDelete(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Fshirja dështoi");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-3.5 py-4 sm:px-6 sm:py-6">
      <PageHeader title="Orë Pune" actionLabel="Shto seancë pune" onAction={openAdd} />

      <WorkSummaryStrip />

      {status === "loading" && <LoadingBlock lines={4} />}
      {status === "error" && (
        <ErrorState message="Lista nuk u ngarkua." onRetry={reload} />
      )}
      {status === "ready" && items.length === 0 && (
        <EmptyState
          title="Ende pa seanca pune të regjistruara"
          hint="Shto seancën e parë: fillimi dhe mbarimi si datë + orë."
        />
      )}
      {status === "ready" && items.length > 0 && (
        <WorkSessionList
          items={items}
          onEdit={(s) => {
            setEditing(s);
            setSheetOpen(true);
          }}
          onDelete={setToDelete}
        />
      )}

      <WorkSessionSheet
        open={sheetOpen}
        initial={editing}
        onClose={() => setSheetOpen(false)}
        onSaved={onSaved}
      />

      <Confirm
        open={Boolean(toDelete)}
        title="Fshi seancën"
        message={
          toDelete
            ? `Do të fshihet seanca e punës e datës ${fullDate(toDelete.work_date)}.`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
