"use client";

import { useState } from "react";
import { ApiError, deleteSleep, type DaySleep, type Sleep } from "@/lib/api";
import { durationLabel, timeLabel } from "@/lib/date";
import { IconPencil, IconTrash, IconMoon } from "@/components/icons";
import DaySection from "@/components/dita/DaySection";
import DayHeaderAction from "@/components/dita/DayHeaderAction";
import Confirm from "@/components/common/Confirm";
import SleepSheet from "@/components/gjumi/SleepSheet";

interface Props {
  date: string;
  items: DaySleep[];
  onChanged: () => void;
}

function toSleep(item: DaySleep, date: string): Sleep {
  return {
    id: item.id,
    sleep_start: item.sleep_start,
    sleep_end: item.sleep_end,
    night_date: date,
    duration_minutes: String(item.duration_minutes),
    note: item.note,
    created_at: "",
    updated_at: "",
  };
}

export default function DaySleepSection({ date, items, onChanged }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<DaySleep | null>(null);
  const [toDelete, setToDelete] = useState<DaySleep | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteSleep(toDelete.id);
      setToDelete(null);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Fshirja dështoi");
    }
  };

  return (
    <>
      <DaySection
        icon={IconMoon}
        title="Gjumi"
        accent="violet"
        count={items.length}
        isEmpty={items.length === 0}
        emptyLabel="pa gjumë të regjistruar"
        action={
          <DayHeaderAction
            label="Shto gjumë"
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
                {timeLabel(s.sleep_start)}–{timeLabel(s.sleep_end)}
                <span className="text-text-lo">
                  {" · "}
                  {durationLabel(s.duration_minutes)}
                </span>
              </span>
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

      <SleepSheet
        key={editing?.id ?? "new"}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={onChanged}
        initial={editing ? toSleep(editing, date) : null}
        defaultDate={date}
      />

      <Confirm
        open={Boolean(toDelete)}
        title="Fshi gjumin"
        message="Ky rresht gjumi do të fshihet përfundimisht."
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
