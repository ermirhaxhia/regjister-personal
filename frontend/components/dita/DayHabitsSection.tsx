"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import {
  ApiError,
  upsertHabitLog,
  deleteHabitLog,
  type DayHabit,
} from "@/lib/api";
import { IconHabits } from "@/components/icons";
import DaySection from "@/components/dita/DaySection";
import TodayControl from "@/components/zakone/TodayControl";

interface Props {
  date: string;
  items: DayHabit[];
  onChanged: () => void;
}

export default function DayHabitsSection({ date, items, onChanged }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggle = async (habit: DayHabit) => {
    if (busyId) return;
    setBusyId(habit.habit_id);
    setError(null);
    try {
      if (!habit.done) await upsertHabitLog(habit.habit_id, date, { done: true });
      else await deleteHabitLog(habit.habit_id, date);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ndryshimi dështoi");
    } finally {
      setBusyId(null);
    }
  };

  const commitDuration = async (habit: DayHabit, value: number) => {
    const n = Math.max(0, Math.round(value || 0));
    if (n === (habit.duration_minutes ?? 0)) return;
    setBusyId(habit.habit_id);
    setError(null);
    try {
      if (n > 0) await upsertHabitLog(habit.habit_id, date, { duration_minutes: n });
      else await deleteHabitLog(habit.habit_id, date);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ndryshimi dështoi");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DaySection
      icon={IconHabits}
      title="Zakone"
      accent="violet"
      count={items.length}
      isEmpty={items.length === 0}
      emptyLabel="asnjë zakon aktiv"
    >
      {error && <p className="px-4 pt-2.5 text-[12px] text-danger">{error}</p>}
      {items.map((h) => (
        <div
          key={h.habit_id}
          className={cn(
            "flex items-center justify-between gap-3 px-4 py-2.5",
            h.met && "bg-accent-2/[0.05]",
          )}
        >
          <div className="min-w-0">
            <span className="min-w-0 truncate text-[13px] text-text-hi">
              {h.name}
            </span>
            {h.note && <p className="mt-1 text-xs text-text-lo">{h.note}</p>}
          </div>
          <TodayControl
            habitId={h.habit_id}
            trackingType={h.tracking_type}
            met={h.met}
            durationMinutes={h.duration_minutes}
            name={h.name}
            onToggle={() => toggle(h)}
            onCommitDuration={(v) => commitDuration(h, v)}
          />
        </div>
      ))}
    </DaySection>
  );
}
