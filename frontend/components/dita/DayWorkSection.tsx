"use client";

import { useCallback, useState } from "react";
import {
  ApiError,
  deleteWorkSession,
  listWorkSessions,
  type WorkSession,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { durationLabel, timeLabel } from "@/lib/date";
import { IconPencil, IconTrash, IconBriefcase } from "@/components/icons";
import DaySection from "@/components/dita/DaySection";
import DayHeaderAction from "@/components/dita/DayHeaderAction";
import Confirm from "@/components/common/Confirm";
import WorkSessionSheet from "@/components/ore-pune/WorkSessionSheet";

interface Props {
  date: string;
  onChanged: () => void;
}

export default function DayWorkSection({ date, onChanged }: Props) {
  const [items, setItems] = useState<WorkSession[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<WorkSession | null>(null);
  const [toDelete, setToDelete] = useState<WorkSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(() => listWorkSessions(date, date), [date]);
  const applyList = useCallback((data: WorkSession[]) => setItems(data), []);
  const { refresh } = useGenLoad(fetchList, applyList);

  const afterChange = () => {
    refresh();
    onChanged();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteWorkSession(toDelete.id);
      setToDelete(null);
      afterChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Fshirja dështoi");
    }
  };

  return (
    <>
      <DaySection
        icon={IconBriefcase}
        title="Orë Pune"
        accent="orange"
        count={items.length}
        isEmpty={items.length === 0}
        emptyLabel="pa seanca pune të regjistruara"
        action={
          <DayHeaderAction
            label="Shto seancë pune"
            onClick={() => {
              setEditing(null);
              setSheetOpen(true);
            }}
          />
        }
      >
        {items.map((s) => (
          <div key={s.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
            <div className="min-w-0">
              <span className="font-mono text-[12.5px] text-text-hi">
                {timeLabel(s.start_ts)}–{timeLabel(s.end_ts)}
                <span className="text-text-lo">
                  {" · "}
                  {durationLabel(s.duration_minutes)}
                </span>
              </span>
              {s.workplace_name && (
                <p className="mt-1 text-xs text-text-lo">{s.workplace_name}</p>
              )}
              {s.note && <p className="mt-1 text-xs text-text-lo">{s.note}</p>}
            </div>
            <span className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(s);
                  setSheetOpen(true);
                }}
                aria-label="Redakto"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-text-hi"
              >
                <IconPencil size={13} />
              </button>
              <button
                type="button"
                onClick={() => setToDelete(s)}
                aria-label="Fshi"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-danger"
              >
                <IconTrash size={13} />
              </button>
            </span>
          </div>
        ))}
      </DaySection>

      {error && <p className="px-1 text-[12px] text-danger">{error}</p>}

      <WorkSessionSheet
        key={editing?.id ?? "new"}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={afterChange}
        initial={editing}
        defaultDate={date}
      />

      <Confirm
        open={Boolean(toDelete)}
        title="Fshi seancën"
        message="Kjo seancë pune do të fshihet përfundimisht."
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
