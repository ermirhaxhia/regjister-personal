"use client";

import { useCallback, useState } from "react";
import {
  ApiError,
  listUnits,
  listActivityTypes,
  createActivityType,
  updateActivityType,
  deleteActivityType,
  type ActivityType,
  type ActivityTypeInput,
  type ActivityUnit,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { notifyDataChanged } from "@/components/shell/ShellContext";
import { LoadingBlock, ErrorState } from "@/components/common/States";
import { IconPlus, IconPencil, IconTrash } from "@/components/icons";
import { formatUnitValue, shortUnit } from "@/lib/fitnessUnits";
import ActivityTypeForm from "@/components/cilesime/ActivityTypeForm";

type Loaded = [ActivityType[], ActivityUnit[]];

function unitLabels(t: ActivityType, units: ActivityUnit[]): string[] {
  return t.units.map((k) => units.find((u) => u.key === k)?.label ?? k);
}

export default function ActivityTypeManager() {
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [units, setUnits] = useState<ActivityUnit[]>([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const fetchAll = useCallback(
    (): Promise<Loaded> => Promise.all([listActivityTypes(), listUnits()]),
    [],
  );
  const applyAll = useCallback(([t, u]: Loaded) => {
    setTypes(t);
    setUnits(u);
  }, []);
  const { status, reload } = useGenLoad(fetchAll, applyAll);

  const add = async (body: ActivityTypeInput) => {
    const row = await createActivityType(body);
    setTypes((prev) => [...prev, row]);
    setAdding(false);
    notifyDataChanged();
  };

  const saveEdit = (id: string) => async (body: ActivityTypeInput) => {
    const row = await updateActivityType(id, body);
    setTypes((prev) => prev.map((t) => (t.id === id ? row : t)));
    setEditingId(null);
  };

  const remove = async (t: ActivityType) => {
    setRowError(null);
    try {
      await deleteActivityType(t.id);
      setTypes((prev) => prev.filter((x) => x.id !== t.id));
      notifyDataChanged();
    } catch (err) {
      setRowError(
        err instanceof ApiError
          ? err.status === 409
            ? "Ky lloj ka hyrje — fshiji ato më parë."
            : err.message
          : "Fshirja dështoi.",
      );
    }
  };

  const ready = status === "ready" || status === "refreshing";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-text-lo">
        Çdo lloj ka një emër të lirë dhe një ose disa njësi matëse. Synimi ditor
        është opsional.
      </p>

      {status === "loading" && <LoadingBlock lines={2} />}
      {status === "error" && (
        <ErrorState message="Llojet nuk u ngarkuan." onRetry={reload} />
      )}

      {ready && (
        <>
          {types.length === 0 && !adding && (
            <p className="rounded-xl border border-dashed border-border bg-surface-2/30 px-4 py-6 text-center text-xs text-text-lo">
              Ende pa lloje. Shto të parin poshtë.
            </p>
          )}

          {types.length > 0 && (
            <ul className="flex flex-col">
              {types.map((t) =>
                editingId === t.id ? (
                  <li
                    key={t.id}
                    className="rounded-xl border border-border bg-surface-2/40 p-3"
                  >
                    <ActivityTypeForm
                      units={units}
                      initial={t}
                      submitLabel="Ruaj"
                      onCancel={() => setEditingId(null)}
                      onSubmit={saveEdit(t.id)}
                    />
                  </li>
                ) : (
                  <li
                    key={t.id}
                    className="flex items-start justify-between gap-3 border-b border-border py-3 last:border-0"
                  >
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <span className="text-sm text-text-hi">{t.name}</span>
                      <div className="flex flex-wrap gap-1">
                        {unitLabels(t, units).map((c) => (
                          <span
                            key={c}
                            className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-text-lo"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      {t.daily_goal != null && t.goal_unit && (
                        <span className="font-mono text-[11px] text-accent-2">
                          synim: {formatUnitValue(t.daily_goal)}{" "}
                          {shortUnit(t.goal_unit)}
                        </span>
                      )}
                    </div>
                    <span className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setRowError(null);
                          setEditingId(t.id);
                        }}
                        aria-label="Modifiko llojin"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-text-hi"
                      >
                        <IconPencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(t)}
                        aria-label="Fshi llojin"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-danger"
                      >
                        <IconTrash size={13} />
                      </button>
                    </span>
                  </li>
                ),
              )}
            </ul>
          )}

          {rowError && <p className="text-[12px] text-danger">{rowError}</p>}

          {adding ? (
            <div className="rounded-xl border border-border bg-surface-2/40 p-3">
              <ActivityTypeForm
                units={units}
                submitLabel="Shto lloj"
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
              Shto lloj
            </button>
          )}
        </>
      )}
    </div>
  );
}
