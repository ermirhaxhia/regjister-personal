"use client";

import { motion } from "framer-motion";
import { IconPlus } from "@/components/icons";
import { dayMonth, todayISO } from "@/lib/date";
import { describeValues, shortUnit } from "@/lib/fitnessUnits";
import type { ActivityType, FitnessEntry, FitnessGoalBlock } from "@/lib/api";
import GoalBody from "@/components/aktivitet/GoalBody";

interface Props {
  type: ActivityType;
  goal?: FitnessGoalBlock;
  entries: FitnessEntry[];
  onAdd: () => void;
}

function countThisMonth(entries: FitnessEntry[]): number {
  const m = todayISO().slice(0, 7);
  return entries.filter((e) => e.entry_date.slice(0, 7) === m).length;
}

export default function ActivityCard({ type, goal, entries, onAdd }: Props) {
  const latest = entries[0] ?? null;
  const monthCount = countThisMonth(entries);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
      role="button"
      tabIndex={0}
      onClick={onAdd}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAdd();
        }
      }}
      aria-label={`Shto — ${type.name}`}
      className="group flex cursor-pointer flex-col gap-4 rounded-2xl border border-border bg-surface p-5 text-left outline-none transition-colors hover:border-accent/40 focus-visible:border-accent/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <h3 className="truncate font-display text-sm font-semibold text-text-hi">
            {type.name}
          </h3>
          <div className="flex flex-wrap gap-1">
            {type.units.map((u) => (
              <span
                key={u}
                className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-text-lo"
              >
                {shortUnit(u)}
              </span>
            ))}
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-2 py-1 font-mono text-[10px] text-text-mid transition-colors group-hover:border-accent/40 group-hover:text-accent">
          <IconPlus size={12} />
          Shto
        </span>
      </div>

      {goal ? (
        <GoalBody goal={goal} />
      ) : (
        <div className="flex flex-col gap-1.5 border-t border-border pt-3">
          <span className="font-mono text-[11px] text-text-lo">
            {latest
              ? `Fundit: ${describeValues(latest.values)} · ${dayMonth(latest.entry_date)}`
              : "Ende pa hyrje"}
          </span>
          <span className="font-mono text-[11px] text-text-lo">
            {monthCount} hyrje këtë muaj
          </span>
        </div>
      )}
    </motion.div>
  );
}
