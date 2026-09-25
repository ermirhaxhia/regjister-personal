"use client";

import { IconPlus } from "@/components/icons";

export default function DayHeaderAction({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:border-accent/50 hover:text-text-hi"
    >
      <IconPlus size={14} />
    </button>
  );
}
