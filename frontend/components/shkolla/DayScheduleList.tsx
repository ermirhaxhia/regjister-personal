"use client";

import { useCallback, useState } from "react";
import {
  ApiError,
  getDaySchedule,
  upsertAttendance,
  type DaySchedule,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { LoadingBlock, ErrorState } from "@/components/common/States";
import { timeShort } from "@/lib/weekday";
import AttendanceToggle from "@/components/shkolla/AttendanceToggle";

interface Props {
  date: string;
  emptyLabel?: string;
  onChanged?: () => void;
}

export default function DayScheduleList({
  date,
  emptyLabel = "pa seanca të planifikuara për këtë ditë",
  onChanged,
}: Props) {
  const [items, setItems] = useState<DaySchedule[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(() => getDaySchedule(date), [date]);
  const applyList = useCallback((data: DaySchedule[]) => setItems(data), []);
  const { status, reload } = useGenLoad(fetchList, applyList);

  const pick = async (row: DaySchedule, attended: boolean) => {
    setBusyId(row.session_id);
    setError(null);
    try {
      await upsertAttendance(row.session_id, date, { attended });
      setItems((prev) =>
        prev.map((x) =>
          x.session_id === row.session_id ? { ...x, attended } : x,
        ),
      );
      onChanged?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ruajtja dështoi.");
    } finally {
      setBusyId(null);
    }
  };

  if (status === "loading") return <LoadingBlock lines={2} />;
  if (status === "error") {
    return <ErrorState message="Orari i ditës nuk u ngarkua." onRetry={reload} />;
  }

  if (items.length === 0) {
    return <p className="px-4 py-3 text-xs text-text-lo">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {error && <p className="px-4 py-2 text-[12px] text-danger">{error}</p>}
      {items.map((row) => (
        <div
          key={row.session_id}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5"
        >
          <div className="min-w-0">
            <p className="truncate text-[13px] text-text-hi">
              {row.subject_name}
            </p>
            <p className="font-mono text-[11px] text-text-lo">
              {timeShort(row.start_time)}–{timeShort(row.end_time)}
              {row.session_type ? ` · ${row.session_type}` : ""}
              {row.room ? ` · ${row.room}` : ""}
            </p>
          </div>
          <AttendanceToggle
            attended={row.attended}
            busy={busyId === row.session_id}
            onPick={(attended) => void pick(row, attended)}
          />
        </div>
      ))}
    </div>
  );
}
