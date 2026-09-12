"use client";

import { motion } from "framer-motion";
import { dayMonth } from "@/lib/date";
import { formatUnitValue, shortUnit } from "@/lib/fitnessUnits";
import type { FitnessSeriesPoint } from "@/lib/api";

interface Props {
  series: FitnessSeriesPoint[];
  goal: number;
  unit: string;
}

const W = 320;
const H = 68;
const TOP = 6;
const BOT = 6;
const PLOT = H - TOP - BOT;

export default function GoalMiniChart({ series, goal, unit }: Props) {
  const totals = series.map((p) => p.total);
  const max = Math.max(...totals, 0);
  const scale = Math.max(goal * 1.15, max * 1.05, 1);
  const slot = W / Math.max(series.length, 1);
  const barW = Math.max(2, slot * 0.6);
  const goalY = TOP + PLOT * (1 - goal / scale);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="block h-[68px] w-full"
      role="img"
      aria-label={`Historiku ${series.length}-ditor`}
    >
      {series.map((p, i) => {
        const x = i * slot + (slot - barW) / 2;
        const h = p.total > 0 ? Math.max(2, (p.total / scale) * PLOT) : 1.5;
        const y = TOP + PLOT - h;
        const met = goal > 0 && p.total >= goal;
        return (
          <motion.rect
            key={p.date}
            x={x}
            width={barW}
            rx={1.5}
            fill={p.total > 0 ? (met ? "#34dd93" : "#ff7a3c") : "#26262e"}
            initial={{ y: TOP + PLOT, height: 0 }}
            animate={{ y, height: h }}
            transition={{
              duration: 0.5,
              delay: 0.1 + i * 0.01,
              ease: [0.2, 0.7, 0.2, 1],
            }}
          >
            <title>{`${dayMonth(p.date)} · ${formatUnitValue(p.total)} ${shortUnit(unit)}`}</title>
          </motion.rect>
        );
      })}

      {goal > 0 && (
        <line
          x1={0}
          x2={W}
          y1={goalY}
          y2={goalY}
          stroke="#8b7bff"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
