"use client";

import { addDays, fullDate, todayISO } from "@/lib/date";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

interface Props {
  date: string;
  onChange: (iso: string) => void;
}

const stepClass =
  "flex h-8 w-8 items-center justify-center rounded-[9px] border border-border text-text-mid transition-colors enabled:hover:border-accent/50 enabled:hover:text-text-hi disabled:opacity-35";

export default function DayNav({ date, onChange }: Props) {
  const today = todayISO();
  const isToday = date === today;
  const atMax = date >= today;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(addDays(date, -1))}
          aria-label="Dita para"
          className={stepClass}
        >
          <IconChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => onChange(addDays(date, 1))}
          disabled={atMax}
          aria-label="Dita pas"
          className={stepClass}
        >
          <IconChevronRight size={16} />
        </button>
      </div>

      <input
        type="date"
        value={date}
        max={today}
        onChange={(e) => {
          if (e.target.value) onChange(e.target.value);
        }}
        aria-label="Zgjidh datën"
        className="[color-scheme:dark] rounded-[10px] border border-border bg-surface px-3 py-1.5 font-mono text-[12.5px] text-text-hi outline-none focus:border-accent/50"
      />

      <span className="font-display text-[13px] text-text-mid">
        {fullDate(date)}
      </span>

      <button
        type="button"
        onClick={() => onChange(today)}
        disabled={isToday}
        className="ml-auto rounded-[10px] border border-border px-3 py-1.5 text-[12.5px] text-text-mid transition-colors enabled:hover:border-accent/50 enabled:hover:text-text-hi disabled:opacity-35"
      >
        Sot
      </button>
    </div>
  );
}
