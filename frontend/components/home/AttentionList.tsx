"use client";

import type { ComponentType } from "react";
import { cn } from "@/lib/cn";
import type { SummaryFlag } from "@/lib/api";
import {
  IconReceipt,
  IconMoon,
  IconHabits,
  IconAlert,
} from "@/components/icons";

type IconType = ComponentType<{ size?: number; className?: string }>;

const MODULE_ICON: Record<SummaryFlag["module"], IconType> = {
  expenses: IconReceipt,
  sleep: IconMoon,
  habits: IconHabits,
  general: IconAlert,
};

export default function AttentionList({ flags }: { flags: SummaryFlag[] }) {
  if (!flags || flags.length === 0) return null;

  return (
    <div className="rp-card rounded-[18px] border border-border bg-surface px-5 py-4 sm:px-[22px]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-lo">
        Vëmendje
      </div>
      <ul className="mt-1.5 divide-y divide-border">
        {flags.map((f) => {
          const Icon = MODULE_ICON[f.module] ?? IconAlert;
          const warn = f.severity === "warn";
          return (
            <li
              key={f.id}
              className="flex items-stretch gap-3 py-3 first:pt-2 last:pb-1"
            >
              <span
                className={cn(
                  "w-[3px] shrink-0 rounded-full",
                  warn ? "bg-danger" : "bg-accent-2",
                )}
              />
              <span
                className={cn(
                  "mt-px shrink-0",
                  warn ? "text-danger" : "text-accent-2",
                )}
              >
                <Icon size={15} />
              </span>
              <p className="text-[13px] leading-snug text-text-mid">{f.text}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
