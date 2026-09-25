"use client";

import { useState } from "react";

interface Props {
  initial: number;
  unitLabel: string;
  onCommit: (value: number) => void;
}

export default function CountMark({ initial, unitLabel, onCommit }: Props) {
  const [value, setValue] = useState(initial ? String(initial) : "");

  const commit = () => {
    const n = value.trim() === "" ? 0 : Number(value);
    if (Number.isNaN(n)) {
      setValue(initial ? String(initial) : "");
      return;
    }
    onCommit(Math.max(0, Math.round(n)));
  };

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <input
        type="number"
        inputMode="numeric"
        min="0"
        step="1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
        aria-label={`${unitLabel} sot`}
        placeholder="0"
        className="h-8 w-[72px] rounded-md border border-border bg-surface-2 text-center font-mono text-xs text-text-hi outline-none transition-colors focus:border-accent/60"
      />
      <span className="max-w-[64px] truncate font-mono text-[10px] text-text-lo">
        {unitLabel}
      </span>
    </div>
  );
}
