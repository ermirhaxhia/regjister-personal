"use client";

import type { ComponentType } from "react";
import { cn } from "@/lib/cn";
import type { Insight } from "@/lib/api";
import {
  IconMoon,
  IconReceipt,
  IconBanknote,
  IconActivity,
  IconSpark,
} from "@/components/icons";

type IconType = ComponentType<{ size?: number; className?: string }>;

const KIND_ICON: Record<Insight["kind"], IconType> = {
  sleep_spend: IconMoon,
  weekday_spend: IconReceipt,
  payday_window: IconBanknote,
  fitness_habits: IconActivity,
  mood_sleep: IconSpark,
};

const CONFIDENCE: Record<
  Insight["confidence"],
  { label: string; dot: string; text: string }
> = {
  low: { label: "besueshmëri e ulët", dot: "bg-text-lo", text: "text-text-lo" },
  medium: {
    label: "besueshmëri mesatare",
    dot: "bg-accent",
    text: "text-accent",
  },
  high: {
    label: "besueshmëri e lartë",
    dot: "bg-success",
    text: "text-success",
  },
};

export default function InsightCard({ insight }: { insight: Insight }) {
  const Icon = KIND_ICON[insight.kind] ?? IconReceipt;
  const conf = CONFIDENCE[insight.confidence] ?? CONFIDENCE.low;

  return (
    <article className="rp-card flex flex-col gap-3 rounded-[18px] border border-border bg-surface px-5 py-5 sm:px-[22px]">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-accent-2/35 bg-accent-2/[0.18] text-accent-2">
          <Icon size={17} />
        </span>
        <h3 className="mt-1 font-display text-[15px] font-semibold leading-tight tracking-tight text-text-hi">
          {insight.title}
        </h3>
      </div>

      <p className="text-[13px] leading-relaxed text-text-mid">
        {insight.detail}
      </p>

      <div className="mt-1 flex items-center justify-between gap-3">
        <span
          className={cn("flex items-center gap-1.5 text-[11px]", conf.text)}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", conf.dot)} />
          {conf.label}
        </span>
        <span className="font-mono text-[10px] text-text-lo">
          {insight.data_points} pika
        </span>
      </div>
    </article>
  );
}
