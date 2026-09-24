"use client";

import { useCallback, useState } from "react";
import { getDashboard, type DashboardRead } from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import PageHeader from "@/components/common/PageHeader";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/common/States";
import DeviationChart from "@/components/dashboard/DeviationChart";
import CategoryDonut from "@/components/dashboard/CategoryDonut";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardRead | null>(null);

  const fetchDashboard = useCallback(() => getDashboard(), []);
  const applyDashboard = useCallback((d: DashboardRead) => setData(d), []);
  const { status, reload } = useGenLoad(fetchDashboard, applyDashboard);

  const ready = status === "ready" || status === "refreshing";
  const noData =
    ready &&
    !!data &&
    data.daily.every((d) => Number(d.expense) === 0 && Number(d.income) === 0);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-3.5 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-1">
        <PageHeader title="Dashboard" />
        <p className="text-[13px] text-text-lo">
          Grafikë mbi shpenzimet dhe të ardhurat — 30 ditët e fundit.
        </p>
      </div>

      {status === "loading" && <LoadingBlock lines={4} />}

      {status === "error" && (
        <ErrorState
          message="Dashboard-i nuk u ngarkua. Kontrollo lidhjen me serverin."
          onRetry={reload}
        />
      )}

      {noData && (
        <div className="py-6">
          <EmptyState
            title="Ende pa të dhëna"
            hint="Grafikët ndizen sapo të shtosh shpenzime ose të ardhura."
          />
        </div>
      )}

      {ready && data && !noData && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rp-card rounded-[18px] border border-border bg-surface px-4 py-4 sm:px-[22px] sm:py-[18px]">
              <h2 className="font-display text-sm font-semibold text-text-hi">
                Devijimi ditor i shpenzimeve
              </h2>
              <DeviationChart
                daily={data.daily}
                meanExpense={data.expense_mean_30d}
              />
            </div>
            <div className="rp-card rounded-[18px] border border-border bg-surface px-4 py-4 sm:px-[22px] sm:py-[18px]">
              <h2 className="font-display text-sm font-semibold text-text-hi">
                Shpenzimet sipas kategorisë
              </h2>
              <div className="mt-3">
                <CategoryDonut categories={data.categories_month} />
              </div>
            </div>
          </div>

          <div className="rp-card rounded-[18px] border border-border bg-surface px-4 py-4 sm:px-[22px] sm:py-[18px]">
            <h2 className="font-display text-sm font-semibold text-text-hi">
              Shpenzime vs. të ardhura
            </h2>
            <div className="mt-3">
              <IncomeExpenseChart daily={data.daily} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
