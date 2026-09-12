"use client";

import { useCallback, useEffect, useState } from "react";
import { getSummary, type Summary } from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { fullDate } from "@/lib/date";
import { useRegisterAdd, notifyDataChanged } from "@/components/shell/ShellContext";
import PageHeader from "@/components/common/PageHeader";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/common/States";
import BalanceCard from "@/components/home/BalanceCard";
import AttentionList from "@/components/home/AttentionList";
import SpendingStrip from "@/components/home/SpendingStrip";
import PaceCard from "@/components/home/PaceCard";
import PaydayCard from "@/components/home/PaydayCard";
import HighlightRow from "@/components/home/HighlightRow";
import ExpenseSheet from "@/components/shpenzime/ExpenseSheet";

function isEmpty(s: Summary): boolean {
  const sp = s.spending;
  const spendingZero =
    sp.today === 0 &&
    sp.yesterday === 0 &&
    sp.week_current === 0 &&
    sp.week_previous === 0 &&
    sp.month_current === 0 &&
    sp.month_previous === 0;
  return (
    s.balance_total === 0 &&
    spendingZero &&
    !s.budget &&
    !s.biggest_expense_week &&
    !s.top_category_month
  );
}

export default function HomePage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchSummary = useCallback(() => getSummary(), []);
  const applySummary = useCallback((data: Summary) => setSummary(data), []);
  const { status, reload } = useGenLoad(fetchSummary, applySummary);

  const softRefresh = useCallback(() => {
    setRefreshing(true);
    getSummary()
      .then((data) => setSummary(data))
      .catch(() => undefined)
      .finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    sessionStorage.removeItem("rp_summary_stale");
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const affectsSummary = (key: unknown) =>
      key === undefined || key === "expenses" || key === "income";

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ key?: string } | null>).detail;
      if (detail && !affectsSummary(detail.key)) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(softRefresh, 300);
    };

    window.addEventListener("rp-data-changed", onChange);
    return () => {
      window.removeEventListener("rp-data-changed", onChange);
      if (timer) clearTimeout(timer);
    };
  }, [softRefresh]);

  const openSheet = useCallback(() => setSheetOpen(true), []);
  useRegisterAdd("Shto shpenzim", openSheet);

  const onExpenseSaved = useCallback(() => {
    sessionStorage.setItem("rp_summary_stale", "1");
    notifyDataChanged({ key: "expenses", diff: 1 });
  }, []);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-3.5 py-4 sm:px-6 sm:py-6">
      <PageHeader title="Faqja kryesore" meta={fullDate(new Date())} />

      {status === "loading" && <LoadingBlock lines={4} />}

      {status === "error" && (
        <ErrorState
          message="Përmbledhja nuk u ngarkua. Kontrollo lidhjen me serverin."
          onRetry={reload}
        />
      )}

      {status === "ready" && summary && isEmpty(summary) && (
        <EmptyState
          title="Ende pa të dhëna"
          hint="Shto shpenzimin e parë për të nisur ndjekjen e balancës dhe ritmit."
          action={
            <button
              type="button"
              onClick={openSheet}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg"
            >
              Shto shpenzimin e parë
            </button>
          }
        />
      )}

      {status === "ready" && summary && !isEmpty(summary) && (
        <div
          className={`flex flex-col gap-4 transition-opacity duration-200 ${
            refreshing ? "opacity-60" : "opacity-100"
          }`}
          aria-busy={refreshing}
        >
          {refreshing && (
            <span
              className="flex items-center gap-2 self-end font-mono text-[11px] text-text-lo"
              role="status"
            >
              <span className="h-3 w-3 animate-spin rounded-full border border-text-lo border-t-transparent" />
              Duke përditësuar…
            </span>
          )}
          <BalanceCard summary={summary} />
          <AttentionList flags={summary.flags ?? []} />
          <SpendingStrip s={summary.spending} />
          <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
            <PaceCard budget={summary.budget} />
            <PaydayCard budget={summary.budget} />
          </div>
          <HighlightRow summary={summary} />
        </div>
      )}

      <ExpenseSheet
        key={sheetOpen ? "open" : "closed"}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={onExpenseSaved}
      />
    </div>
  );
}
