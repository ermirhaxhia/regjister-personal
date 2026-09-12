"use client";

import { cn } from "@/lib/cn";
import { IconArrowUpRight, IconArrowDownRight } from "@/components/icons";

interface Props {
  current: number;
  previous: number;
  suffix?: string;
  lowerIsBetter?: boolean;
}

export default function Delta({
  current,
  previous,
  suffix = "",
  lowerIsBetter = true,
}: Props) {
  if (previous === 0) {
    return (
      <span className="font-mono text-[11px] text-text-lo">
        pa krahasim{suffix}
      </span>
    );
  }

  const diff = current - previous;
  const pct = Math.round((diff / previous) * 100);
  const up = diff > 0;
  const good = lowerIsBetter ? diff <= 0 : diff >= 0;
  const Icon = up ? IconArrowUpRight : IconArrowDownRight;

  return (
    <span
      className={cn(
        "flex items-center gap-1 font-mono text-[11px]",
        good ? "text-success" : "text-danger",
      )}
    >
      <Icon size={12} />
      {Math.abs(pct)}%{suffix}
    </span>
  );
}
