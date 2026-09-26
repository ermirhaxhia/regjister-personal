"use client";

import { useState } from "react";
import { todayISO } from "@/lib/date";
import PageHeader from "@/components/common/PageHeader";
import DayNav from "@/components/dita/DayNav";
import WeekScheduleGrid from "@/components/shkolla/WeekScheduleGrid";
import DayScheduleList from "@/components/shkolla/DayScheduleList";
import AttendanceSummaryList from "@/components/shkolla/AttendanceSummaryList";

export default function SchoolPage() {
  const [date, setDate] = useState(todayISO());

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-3.5 py-4 sm:px-6 sm:py-6">
      <PageHeader title="Shkolla" />

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-sm font-semibold text-text-hi">
          Orari javor
        </h2>
        <WeekScheduleGrid />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-sm font-semibold text-text-hi">
          Prezenca ditore
        </h2>
        <DayNav date={date} onChange={setDate} />
        <div className="rounded-2xl border border-border bg-surface">
          <DayScheduleList date={date} />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-sm font-semibold text-text-hi">
          Përqindja e prezencës
        </h2>
        <AttendanceSummaryList />
      </section>
    </div>
  );
}
