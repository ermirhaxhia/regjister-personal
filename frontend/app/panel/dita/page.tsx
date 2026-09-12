"use client";

import { useCallback, useState } from "react";
import { getDay, type DayView } from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { todayISO } from "@/lib/date";
import PageHeader from "@/components/common/PageHeader";
import { LoadingBlock, ErrorState } from "@/components/common/States";
import DayNav from "@/components/dita/DayNav";
import DayBoard from "@/components/dita/DayBoard";

export default function DayPage() {
  const [date, setDate] = useState<string>(todayISO());
  const [day, setDay] = useState<DayView | null>(null);

  const fetchDay = useCallback(() => getDay(date), [date]);
  const applyDay = useCallback((d: DayView) => setDay(d), []);
  const { status, reload } = useGenLoad(fetchDay, applyDay);

  const refreshing = status === "refreshing";

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-3.5 py-4 sm:px-6 sm:py-6">
      <PageHeader title="Dita" />
      <DayNav date={date} onChange={setDate} />

      {status === "loading" && <LoadingBlock lines={5} />}
      {status === "error" && (
        <ErrorState
          message="Dita nuk u ngarkua. Kontrollo lidhjen me serverin."
          onRetry={reload}
        />
      )}
      {(status === "ready" || status === "refreshing") && day && (
        <div
          className={
            "transition-opacity duration-200 " +
            (refreshing ? "pointer-events-none opacity-60" : "opacity-100")
          }
          aria-busy={refreshing}
        >
          <DayBoard day={day} />
        </div>
      )}
    </div>
  );
}
