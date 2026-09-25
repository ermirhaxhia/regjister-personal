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

export default function HabitTableRow({
  row,
  today,
  days,
  onToggle,
  onCommitDuration,
}: Props) {
  const last = row.cells[row.cells.length - 1];

  return (
    <tr className="h-16 border-b border-border align-middle transition-colors last:border-0 hover:bg-white/[0.02]">
      <td className="px-4">
        <HabitName
          name={row.name}
          trackingType={row.tracking_type}
          unitLabel={row.unit_label}
        />
      </td>
      <td className="px-2">
        <TodayControl
          habitId={row.id}
          trackingType={row.tracking_type}
          met={last.met}
          durationMinutes={last.duration_minutes}
          name={row.name}
          onToggle={onToggle}
          onCommitDuration={onCommitDuration}
        />
      </td>
      <td className="px-3">
        <StreakBadge value={row.streak_current} />
      </td>
      <td className="px-3">
        <RateBar cells={row.cells} />
      </td>
      <td className="px-3">
        <HabitHistory cells={row.cells} today={today} count={days} fill />
      </td>
    </tr>
  );
}
