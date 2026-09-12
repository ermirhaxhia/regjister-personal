"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  getHabitsGrid,
  type HabitGridRow,
  type HabitsGrid,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { todayISO } from "@/lib/date";
import PageHeader from "@/components/common/PageHeader";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/common/States";
import HabitsTable from "@/components/zakone/HabitsTable";

export default function HabitsPage() {
  const today = todayISO();
  const [grid, setGrid] = useState<HabitsGrid | null>(null);
  const [days, setDays] = useState<14 | 30>(14);

  const fetchGrid = useCallback(() => getHabitsGrid(days), [days]);
  const applyGrid = useCallback((g: HabitsGrid) => setGrid(g), []);
  const { status, reload } = useGenLoad(fetchGrid, applyGrid);

  const refreshGrid = useCallback(() => {
    getHabitsGrid(days)
      .then(setGrid)
      .catch(() => undefined);
  }, [days]);

  const changeDays = useCallback((d: 14 | 30) => {
    setDays(d);
  }, []);

  const applyOptimistic = useCallback(
    (habitId: string, updater: (row: HabitGridRow) => HabitGridRow) => {
      setGrid((g) =>
        g
          ? {
              ...g,
              habits: g.habits.map((r) => (r.id === habitId ? updater(r) : r)),
            }
          : g,
      );
    },
    [],
  );

  const ready = (status === "ready" || status === "refreshing") && grid !== null;
  const hasActive = ready && grid.habits.length > 0;
  const noHabits = ready && grid.habits.length === 0;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-3.5 py-4 sm:px-6 sm:py-6">
      <PageHeader title="Zakone" />

      <p className="text-[13px] text-text-lo">
        Shëno ditën për çdo zakon. Krijimi dhe arkivimi bëhen te{" "}
        <Link
          href="/panel/cilesime"
          className="text-accent-2 underline-offset-2 hover:underline"
        >
          Cilësimet
        </Link>
        .
      </p>

      {status === "loading" && <LoadingBlock lines={4} />}
      {status === "error" && (
        <ErrorState message="Rrjeta nuk u ngarkua." onRetry={reload} />
      )}

      {noHabits && (
        <EmptyState
          title="Ende pa zakone"
          hint="Zakonet krijohen te Cilësimet — zgjidh një emër dhe llojin («po-jo» ose «minuta»), pastaj shënoji çdo ditë këtu. Ditët e mbajtura radhazi ndërtojnë serinë."
          action={
            <Link
              href="/panel/cilesime"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
            >
              Hap Cilësimet
            </Link>
          }
        />
      )}

      {hasActive && grid && (
        <HabitsTable
          grid={grid}
          today={today}
          days={days}
          onDaysChange={changeDays}
          onOptimistic={applyOptimistic}
          onRefresh={refreshGrid}
        />
      )}
    </div>
  );
}
