"use client";

import { cn } from "@/lib/cn";
import { IconFlame } from "@/components/icons";
import type { HabitGridCell, HabitTrackingType } from "@/lib/api";

export function HabitName({
  name,
  trackingType,
}: {
  name: string;
  trackingType: HabitTrackingType;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate font-display text-[14px] font-medium text-text-hi">
        {name}
      </span>
      <span className="font-mono text-[10px] text-text-lo">
        {trackingType === "binary"
          ? "po / jo"
          : trackingType === "duration"
            ? "minuta"
            : "libra"}
      </span>
    </div>
  );
}

export function StreakBadge({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1 whitespace-nowrap font-mono text-[11px]",
        value >= 3 ? "text-accent" : "text-text-mid",
      )}
    >
      {value >= 3 && <IconFlame size={12} />}
      {value} ditë
    </span>
  );
}

export function RateBar({ cells }: { cells: HabitGridCell[] }) {
  const total = cells.length;
  const met = cells.reduce((n, c) => (c.met ? n + 1 : n), 0);
  const width = total > 0 ? (met / total) * 100 : 0;
  return (
    <div className="flex flex-col gap-1">
      <span className="whitespace-nowrap font-mono text-[11px] text-text-mid">
        {met} / {total} ditë
      </span>
      <span className="h-1 w-full overflow-hidden rounded-full bg-[#22222a]">
        <span
          className="block h-full rounded-full bg-accent-2"
          style={{ width: `${width}%` }}
        />
      </span>
    </div>
  );
}
