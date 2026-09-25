"use client";

import { useCallback, useState } from "react";
import { getWeeklySummary, type WeeklySummaryRead } from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { addDays, weekRangeLabel, durationLabel } from "@/lib/date";
import { formatALL } from "@/lib/money";
import PageHeader from "@/components/common/PageHeader";
import { LoadingBlock, ErrorState } from "@/components/common/States";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";
import WeeklyMetricTile from "@/components/rishikimi-javor/WeeklyMetricTile";
import WeeklyReflectionForm from "@/components/rishikimi-javor/WeeklyReflectionForm";

export default function WeeklyReviewPage() {
  const [weekStart, setWeekStart] = useState<string | undefined>(undefined);
  const [data, setData] = useState<WeeklySummaryRead | null>(null);

  const fetcher = useCallback(() => getWeeklySummary(weekStart), [weekStart]);
  const apply = useCallback((d: WeeklySummaryRead) => {
    setData(d);
    setWeekStart(d.week_start);
  }, []);
  const { status, reload } = useGenLoad(fetcher, apply);

  const goToWeek = (base: string, deltaDays: number) => {
    setWeekStart(addDays(base, deltaDays));
  };

  const ready = status === "ready" || status === "refreshing";

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-3.5 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-1">
        <PageHeader title="Java në numra" />
        <p className="text-[13px] text-text-lo">
          Katër numra krahasues javë-me-javë, plus reflektim i shkurtër.
        </p>
      </div>

      {status === "loading" && <LoadingBlock lines={4} />}

      {status === "error" && (
        <ErrorState
          message="Rishikimi javor nuk u ngarkua. Kontrollo lidhjen me serverin."
          onRetry={reload}
        />
      )}

      {ready && data && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <button
              type="button"
              onClick={() => goToWeek(data.week_start, -7)}
              aria-label="Java e kaluar"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-mid transition-colors hover:border-accent/50 hover:text-text-hi"
            >
              <IconChevronLeft size={16} />
            </button>
            <span className="font-display text-sm font-medium text-text-hi">
              {weekRangeLabel(data.week_start, data.week_end)}
            </span>
            <button
              type="button"
              onClick={() => goToWeek(data.week_start, 7)}
              aria-label="Java tjetër"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-mid transition-colors hover:border-accent/50 hover:text-text-hi"
            >
              <IconChevronRight size={16} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <WeeklyMetricTile
              label="Shpenzime"
              metric={data.expenses}
              formatValue={(n) => formatALL(n)}
              formatDiff={(d) => formatALL(d)}
            />
            <WeeklyMetricTile
              label="Gjumi mesatar"
              metric={data.sleep_avg_minutes}
              formatValue={(n) => durationLabel(n)}
              formatDiff={(d) => durationLabel(d)}
            />
            <WeeklyMetricTile
              label="Zakone"
              metric={data.habit_rate_pct}
              formatValue={(n) => `${n.toFixed(0)}%`}
              formatDiff={(d) => `${d.toFixed(0)}pp`}
            />
            <WeeklyMetricTile
              label="Hapa / ditë"
              metric={data.steps_per_day}
              formatValue={(n) => Math.round(n).toLocaleString("de-DE")}
              formatDiff={(d) => Math.round(d).toLocaleString("de-DE")}
            />
          </div>

          <WeeklyReflectionForm weekStart={data.week_start} />
        </div>
      )}
    </div>
  );
}
