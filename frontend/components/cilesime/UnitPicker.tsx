"use client";

import { cn } from "@/lib/cn";
import type { ActivityUnit } from "@/lib/api";

interface Props {
  units: ActivityUnit[];
  selected: string[];
  onToggle: (key: string) => void;
}

export default function UnitPicker({ units, selected, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {units.map((u) => {
        const on = selected.includes(u.key);
        return (
          <button
            key={u.key}
            type="button"
            onClick={() => onToggle(u.key)}
            aria-pressed={on}
            className={cn(
              "rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
              on
                ? "border-accent/50 bg-accent/15 text-text-hi"
                : "border-border text-text-lo hover:text-text-mid",
            )}
          >
            {u.label}
          </button>
        );
      })}
    </div>
  );
}
