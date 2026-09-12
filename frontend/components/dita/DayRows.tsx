import type { ReactNode } from "react";
import { formatALL } from "@/lib/money";
import { formatUnitValue } from "@/lib/fitnessUnits";
import { durationLabel, timeLabel } from "@/lib/date";
import { IconCheck } from "@/components/icons";
import type {
  DayExpense,
  DayFitness,
  DayHabit,
  DayIncome,
  DayNote,
  DaySleep,
} from "@/lib/api";

function Line({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-2.5">
      {children}
    </div>
  );
}

function Amount({ value }: { value: string }) {
  return (
    <span className="shrink-0 font-mono text-[13px] font-semibold text-text-hi">
      {formatALL(value)}
    </span>
  );
}

export function ExpenseRow({ item }: { item: DayExpense }) {
  return (
    <Line>
      <span className="min-w-0 text-[13px] text-text-hi">
        <span className="font-medium">{item.category}</span>
        {item.description && (
          <span className="text-text-lo"> · {item.description}</span>
        )}
      </span>
      <Amount value={item.amount} />
    </Line>
  );
}

export function IncomeRow({ item }: { item: DayIncome }) {
  return (
    <Line>
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate text-[13px] text-text-hi">
          {item.source ?? item.kind}
        </span>
        <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-text-lo">
          {item.kind}
        </span>
      </span>
      <Amount value={item.amount} />
    </Line>
  );
}

export function SleepRow({ item }: { item: DaySleep }) {
  return (
    <div className="px-4 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[12.5px] text-text-hi">
          {timeLabel(item.sleep_start)}–{timeLabel(item.sleep_end)}
          <span className="text-text-lo">
            {" · "}
            {durationLabel(item.duration_minutes)}
          </span>
        </span>
      </div>
      {item.note && <p className="mt-1 text-xs text-text-lo">{item.note}</p>}
    </div>
  );
}

export function HabitRow({ item }: { item: DayHabit }) {
  return (
    <div className="px-4 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-[13px] text-text-hi">
          {item.name}
        </span>
        {item.tracking_type === "binary" ? (
          item.done ? (
            <span className="flex shrink-0 items-center gap-1 font-mono text-[11.5px] text-success">
              <IconCheck size={13} /> U mbajt
            </span>
          ) : (
            <span className="shrink-0 font-mono text-[12.5px] text-text-lo">
              —
            </span>
          )
        ) : (
          <span className="shrink-0 font-mono text-[12.5px] font-semibold text-text-mid">
            {item.duration_minutes ?? 0} min
          </span>
        )}
      </div>
      {item.note && <p className="mt-1 text-xs text-text-lo">{item.note}</p>}
    </div>
  );
}

export function FitnessRow({ item }: { item: DayFitness }) {
  const pairs = Object.entries(item.values ?? {});
  return (
    <div className="px-4 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-[13px] text-text-hi">
          {item.activity_type_name || "—"}
        </span>
        <span className="shrink-0 font-mono text-[12px] text-text-mid">
          {pairs.length > 0
            ? pairs
                .map(([k, v]) => `${k} ${formatUnitValue(v)}`)
                .join(" · ")
            : "—"}
        </span>
      </div>
      {item.note && <p className="mt-1 text-xs text-text-lo">{item.note}</p>}
    </div>
  );
}

export function NoteRow({ item }: { item: DayNote }) {
  return (
    <div className="px-4 py-2.5">
      <span className="text-[13px] font-medium text-text-hi">
        {item.colleague_name}
      </span>
      <p className="mt-1 text-xs text-text-mid">{item.note}</p>
    </div>
  );
}
