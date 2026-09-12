"use client";

import { IconFlame } from "@/components/icons";
import { formatUnitValue, shortUnit } from "@/lib/fitnessUnits";
import type { FitnessGoalBlock } from "@/lib/api";
import ProgressRing from "@/components/aktivitet/ProgressRing";
import GoalMiniChart from "@/components/aktivitet/GoalMiniChart";

function streakLabel(n: number): string {
  if (n <= 0) return "pa seri";
  if (n === 1) return "1 ditë rresht";
  return `${n} ditë rresht`;
}

export default function GoalBody({ goal }: { goal: FitnessGoalBlock }) {
  const remaining = Math.max(0, goal.goal - goal.today_total);
  const met = remaining === 0;

  return (
    <div className="flex flex-col gap-4 border-t border-border pt-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-text-lo">
          synim {formatUnitValue(goal.goal)} {shortUnit(goal.unit)}/ditë
        </span>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[10px] text-accent">
          <IconFlame size={12} />
          {streakLabel(goal.streak)}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <ProgressRing value={goal.today_total} goal={goal.goal} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-mono text-2xl font-semibold text-text-hi">
            {formatUnitValue(goal.today_total)}
          </span>
          <span className="font-mono text-[11px] text-text-lo">
            {shortUnit(goal.unit)} sot
          </span>
          <span
            className={
              met
                ? "mt-1.5 text-xs font-medium text-success"
                : "mt-1.5 text-xs text-text-mid"
            }
          >
            {met
              ? "Synim i arritur"
              : `${formatUnitValue(remaining)} ${shortUnit(goal.unit)} deri te synimi`}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between font-mono text-[10px] text-text-lo">
          <span>{goal.series.length} ditë</span>
          <span>{goal.days_met} ditë të arritura</span>
        </div>
        <GoalMiniChart series={goal.series} goal={goal.goal} unit={goal.unit} />
      </div>
    </div>
  );
}
