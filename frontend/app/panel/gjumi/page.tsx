"use client";

import { useCallback, useState } from "react";
import {
  listSleep,
  deleteSleep,
  ApiError,
  type Sleep,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { fullDate } from "@/lib/date";
import { useRegisterAdd, notifyDataChanged } from "@/components/shell/ShellContext";
import PageHeader from "@/components/common/PageHeader";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/common/States";
import Confirm from "@/components/common/Confirm";
import SleepList from "@/components/gjumi/SleepList";
import SleepSheet from "@/components/gjumi/SleepSheet";
import SleepGoalStrip from "@/components/gjumi/SleepGoalStrip";

export default function SleepPage() {
  const [items, setItems] = useState<Sleep[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Sleep | null>(null);
  const [toDelete, setToDelete] = useState<Sleep | null>(null);

  const fetchList = useCallback(() => listSleep(), []);
  const applyList = useCallback((data: Sleep[]) => setItems(data), []);
  const { status, reload } = useGenLoad(fetchList, applyList);

  const openAdd = useCallback(() => {
    setEditing(null);
    setSheetOpen(true);
  }, []);
  useRegisterAdd("Shto gjumë", openAdd);

  const onSaved = useCallback((row: Sleep, mode: "create" | "update") => {
    if (mode === "update") {
      setItems((prev) => prev.map((r) => (r.id === row.id ? row : r)));
      return;
    }
    notifyDataChanged({ key: "sleep", diff: 1 });
    setItems((prev) => [row, ...prev]);
  }, []);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteSleep(toDelete.id);
      setItems((prev) => prev.filter((r) => r.id !== toDelete.id));
      notifyDataChanged({ key: "sleep", diff: -1 });
      setToDelete(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Fshirja dështoi");
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-3.5 py-4 sm:px-6 sm:py-6">
      <PageHeader title="Gjumi" actionLabel="Shto gjumë" onAction={openAdd} />

      <SleepGoalStrip items={items} />

      {status === "loading" && <LoadingBlock lines={4} />}
      {status === "error" && (
        <ErrorState message="Lista nuk u ngarkua." onRetry={reload} />
      )}
      {status === "ready" && items.length === 0 && (
        <EmptyState
          title="Ende pa netë të regjistruara"
          hint="Shto natën e parë: fillimi dhe fundi si datë + orë."
        />
      )}
      {status === "ready" && items.length > 0 && (
        <SleepList
          items={items}
          onEdit={(s) => {
            setEditing(s);
            setSheetOpen(true);
          }}
          onDelete={setToDelete}
        />
      )}

      <SleepSheet
        open={sheetOpen}
        initial={editing}
        onClose={() => setSheetOpen(false)}
        onSaved={onSaved}
      />

      <Confirm
        open={Boolean(toDelete)}
        title="Fshi natën"
        message={
          toDelete
            ? `Do të fshihet gjumi i natës ${fullDate(toDelete.night_date)}.`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
