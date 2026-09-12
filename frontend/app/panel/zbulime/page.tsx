"use client";

import { useCallback, useState } from "react";
import { getInsights, type InsightsRead } from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import PageHeader from "@/components/common/PageHeader";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/common/States";
import InsightCard from "@/components/zbulime/InsightCard";

export default function ZbulimePage() {
  const [data, setData] = useState<InsightsRead | null>(null);

  const fetchInsights = useCallback(() => getInsights(), []);
  const applyInsights = useCallback((d: InsightsRead) => setData(d), []);
  const { status, reload } = useGenLoad(fetchInsights, applyInsights);

  const ready = status === "ready" || status === "refreshing";
  const empty =
    ready && !!data && (!data.enough_data || data.insights.length === 0);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-3.5 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-1">
        <PageHeader title="Zbulime" />
        <p className="text-[13px] text-text-lo">
          Lidhje mes moduleve — gjumi, paraja, zakonet, stërvitja.
        </p>
      </div>

      {status === "loading" && <LoadingBlock lines={4} />}

      {status === "error" && (
        <ErrorState
          message="Zbulimet nuk u ngarkuan. Kontrollo lidhjen me serverin."
          onRetry={reload}
        />
      )}

      {empty && (
        <div className="py-6">
          <EmptyState
            title="Ende pak të dhëna"
            hint="Zbulimet ndizen kur të kesh rreth një muaj histori nëpër module."
          />
        </div>
      )}

      {ready && data && !empty && (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.insights.map((it) => (
            <InsightCard key={it.id} insight={it} />
          ))}
        </div>
      )}
    </div>
  );
}
