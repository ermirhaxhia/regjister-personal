"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ApiError,
  listClassSessions,
  createClassSession,
  updateClassSession,
  deleteClassSession,
  type ClassSession,
  type ClassSessionInput,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { notifyDataChanged } from "@/components/shell/ShellContext";
import { LoadingBlock, ErrorState } from "@/components/common/States";
import { IconPlus, IconPencil, IconTrash } from "@/components/icons";
import { WEEKDAY_LABELS, timeShort, groupByWeekday } from "@/lib/weekday";
import SchoolSessionForm from "@/components/cilesime/SchoolSessionForm";
import Confirm from "@/components/common/Confirm";

export default function SchoolScheduleManager() {
  const [items, setItems] = useState<ClassSession[]>([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ClassSession | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const fetchAll = useCallback(() => listClassSessions(), []);
  const applyAll = useCallback((data: ClassSession[]) => setItems(data), []);
  const { status, reload } = useGenLoad(fetchAll, applyAll);

  const grouped = useMemo(
    () => groupByWeekday(items, (s) => s.weekday, (s) => s.start_time),
    [items],
  );

  const add = async (body: ClassSessionInput) => {
    const row = await createClassSession(body);
    setItems((prev) => [...prev, row]);
    setAdding(false);
    notifyDataChanged();
  };

  const saveEdit = (id: string) => async (body: ClassSessionInput) => {
    const row = await updateClassSession(id, body);
    setItems((prev) => prev.map((x) => (x.id === id ? row : x)));
    setEditingId(null);
    notifyDataChanged();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setRowError(null);
    try {
      await deleteClassSession(toDelete.id);
      setItems((prev) => prev.filter((x) => x.id !== toDelete.id));
      notifyDataChanged();
      setToDelete(null);
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : "Fshirja dështoi.");
    }
  };

  const ready = status === "ready" || status === "refreshing";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-text-lo">
        Orari javor fiks: çdo seancë ka lëndën, ditën dhe orarin e vet. Fike
        (çaktivizo) një seancë kur mbaron semestri, pa e fshirë historikun.
      </p>

      {status === "loading" && <LoadingBlock lines={3} />}
      {status === "error" && (
        <ErrorState message="Orari nuk u ngarkua." onRetry={reload} />
      )}

      {ready && (
        <>
          {items.length === 0 && !adding && (
            <p className="rounded-xl border border-dashed border-border bg-surface-2/30 px-4 py-6 text-center text-xs text-text-lo">
              Ende pa seanca. Shto të parën poshtë.
            </p>
          )}

          {items.length > 0 && (
            <div className="flex flex-col gap-4">
              {WEEKDAY_LABELS.map((label, weekday) => {
                const rows = grouped.get(weekday);
                if (!rows || rows.length === 0) return null;
                return (
                  <div key={weekday} className="flex flex-col gap-1.5">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-lo">
                      {label}
                    </h3>
                    <ul className="flex flex-col">
                      {rows.map((s) =>
                        editingId === s.id ? (
                          <li
                            key={s.id}
                            className="rounded-xl border border-border bg-surface-2/40 p-3"
                          >
                            <SchoolSessionForm
                              initial={s}
                              submitLabel="Ruaj"
                              onCancel={() => setEditingId(null)}
                              onSubmit={saveEdit(s.id)}
                            />
                          </li>
                        ) : (
                          <li
                            key={s.id}
                            className="flex items-start justify-between gap-3 border-b border-border py-3 last:border-0"
                          >
                            <div className="flex min-w-0 flex-col gap-1">
                              <span className="flex items-center gap-2 text-sm text-text-hi">
                                {s.subject_name}
                                {!s.is_active && (
                                  <span className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-text-lo">
                                    fikur
                                  </span>
                                )}
                              </span>
                              <span className="font-mono text-[11px] text-text-lo">
                                {timeShort(s.start_time)}–{timeShort(s.end_time)}
                                {s.session_type ? ` · ${s.session_type}` : ""}
                                {s.room ? ` · ${s.room}` : ""}
                                {s.professor ? ` · ${s.professor}` : ""}
                              </span>
                            </div>
                            <span className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setRowError(null);
                                  setEditingId(s.id);
                                }}
                                aria-label="Modifiko seancën"
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-text-hi"
                              >
                                <IconPencil size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setToDelete(s)}
                                aria-label="Fshi seancën"
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-danger"
                              >
                                <IconTrash size={13} />
                              </button>
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {rowError && <p className="text-[12px] text-danger">{rowError}</p>}

          {adding ? (
            <div className="rounded-xl border border-border bg-surface-2/40 p-3">
              <SchoolSessionForm
                submitLabel="Shto seancë"
                onCancel={() => setAdding(false)}
                onSubmit={add}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex w-fit items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[13px] text-text-mid transition-colors hover:border-accent/40 hover:text-text-hi"
            >
              <IconPlus size={14} />
              Shto seancë
            </button>
          )}
        </>
      )}

      <Confirm
        open={toDelete !== null}
        title="Fshi seancën"
        message={
          toDelete
            ? `Do të fshihet «${toDelete.subject_name}» bashkë me prezencën e regjistruar për të.`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
