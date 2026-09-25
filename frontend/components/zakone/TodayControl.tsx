"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { IconCheck, IconBook, IconChevronRight } from "@/components/icons";
import DurationMark from "@/components/zakone/DurationMark";
import type { HabitTrackingType } from "@/lib/api";

interface Props {
  habitId: string;
  trackingType: HabitTrackingType;
  met: boolean;
  durationMinutes: number | null;
  name: string;
  onToggle: () => void;
  onCommitDuration: (value: number) => void;
}

export default function TodayControl({
  habitId,
  trackingType,
  met,
  durationMinutes,
  name,
  onToggle,
  onCommitDuration,
}: Props) {
  if (trackingType === "duration") {
    return (
      <div className="flex justify-center">
        <DurationMark
          key={durationMinutes ?? 0}
          initial={durationMinutes ?? 0}
          onCommit={onCommitDuration}
        />
      </div>
    );
  }

  if (trackingType === "koleksion") {
    return (
      <div className="flex justify-center">
        <Link
          href={`/panel/zakone/koleksion/${habitId}`}
          className="flex h-9 items-center gap-1 rounded-lg border border-border px-2.5 text-[12px] text-text-mid transition-colors hover:border-accent-2/50 hover:text-text-hi"
        >
          <IconBook size={14} />
          Koleksion
          <IconChevronRight size={12} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={met}
        aria-label={
          met ? `Hiq shenjën e sotme për ${name}` : `Shëno sot ${name}`
        }
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
          met
            ? "border-accent-2 bg-accent-2 text-bg"
            : "border-border text-text-lo hover:border-accent-2/50 hover:text-text-hi",
        )}
      >
        <IconCheck size={18} />
      </button>
    </div>
  );
}
