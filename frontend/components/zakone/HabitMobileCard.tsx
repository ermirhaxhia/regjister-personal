"use client";

import type { HabitGridRow } from "@/lib/api";
import TodayControl from "@/components/zakone/TodayControl";
import HabitHistory from "@/components/zakone/HabitHistory";
import { HabitName, StreakBadge, RateBar } from "@/components/zakone/HabitCells";

interface Props {
  row: HabitGridRow;
  today: string;
  days: 14 | 30;
  onToggle: () => void;
  onCommitDuration: (value: number) => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[9px] uppercase tracking-wide text-text-lo">
      {children}
    </span>
  );
}

export default function HabitMobileCard({
  row,
  today,
  days,
  onToggle,
  onCommitDuration,
}: Props) {
  const last = row.cells[row.cells.length - 1];

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <HabitName name={row.name} trackingType={row.tracking_type} />

      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Sot</Label>
          <TodayControl
            trackingType={row.tracking_type}
            met={last.met}
            durationMinutes={last.duration_minutes}
            name={row.name}
            onToggle={onToggle}
            onCommitDuration={onCommitDuration}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Seria</Label>
          <StreakBadge value={row.streak_current} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Mbajtur</Label>
          <RateBar cells={row.cells} />
        </div>
      </div>

      <HabitHistory cells={row.cells} today={today} count={days} />
    </article>
  );
}
