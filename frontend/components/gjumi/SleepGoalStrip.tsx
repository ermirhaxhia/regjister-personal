"use client";

import { useEffect, useState } from "react";
import { getSleepGoal, type Sleep } from "@/lib/api";
import { durationLabel } from "@/lib/date";

export default function SleepGoalStrip({ items }: { items: Sleep[] }) {
  const [goalMinutes, setGoalMinutes] = useState<number | null>(null);

  useEffect(() => {
    getSleepGoal()
      .then((g) => setGoalMinutes(g.goal_minutes))
      .catch(() => {});
  }, []);

  if (items.length === 0 || goalMinutes == null) return null;

  const recent = items.slice(0, 7);
  const avg =
    recent.reduce((sum, s) => sum + Number(s.duration_minutes), 0) /
    recent.length;

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-2.5 text-[13px] text-text-mid">
      Mesatarja e fundit: <span className="text-text-hi">{durationLabel(avg)}</span>
      {" · "}
      synimi <span className="text-text-hi">{durationLabel(goalMinutes)}</span>
    </div>
  );
}
