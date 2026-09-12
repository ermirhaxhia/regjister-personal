"use client";

import { inputClass } from "@/components/common/Field";

interface Props {
  value: string;
  onChange: (month: string) => void;
}

export default function MonthFilter({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} h-9 w-auto py-1`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-mid transition-colors hover:text-text-hi"
        >
          Të gjitha
        </button>
      )}
    </div>
  );
}

export function monthRange(month: string): {
  date_from?: string;
  date_to?: string;
} {
  if (!month) return {};
  const [y, m] = month.split("-").map(Number);
  const from = `${month}-01`;
  const last = new Date(y, m, 0).getDate();
  const to = `${month}-${String(last).padStart(2, "0")}`;
  return { date_from: from, date_to: to };
}
