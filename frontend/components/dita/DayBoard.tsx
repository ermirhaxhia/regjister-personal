"use client";

import { useCallback, useState } from "react";
import {
  listExpenseCategories,
  listIncomeSources,
  listActivityTypes,
  listUnits,
  listContacts,
  type ActivityType,
  type ActivityUnit,
  type Contact,
  type DayView,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import DayExpensesSection from "@/components/dita/DayExpensesSection";
import DayIncomeSection from "@/components/dita/DayIncomeSection";
import DaySleepSection from "@/components/dita/DaySleepSection";
import DayHabitsSection from "@/components/dita/DayHabitsSection";
import DayFitnessSection from "@/components/dita/DayFitnessSection";
import DayNotesSection from "@/components/dita/DayNotesSection";
import DayMoodSection from "@/components/dita/DayMoodSection";
import DayWorkSection from "@/components/dita/DayWorkSection";
import DaySchoolSection from "@/components/dita/DaySchoolSection";

type RefData = [string[], string[], ActivityType[], ActivityUnit[], Contact[]];

export default function DayBoard({
  day,
  onChanged,
}: {
  day: DayView;
  onChanged: () => void;
}) {
  const [categories, setCategories] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [units, setUnits] = useState<ActivityUnit[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const fetchRefs = useCallback(
    (): Promise<RefData> =>
      Promise.all([
        listExpenseCategories().then((rows) => rows.map((c) => c.name)),
        listIncomeSources().then((rows) => rows.map((s) => s.name)),
        listActivityTypes(),
        listUnits(),
        listContacts(),
      ]),
    [],
  );
  const applyRefs = useCallback(([c, s, t, u, ct]: RefData) => {
    setCategories(c);
    setSources(s);
    setTypes(t);
    setUnits(u);
    setContacts(ct);
  }, []);
  useGenLoad(fetchRefs, applyRefs);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DayExpensesSection
        date={day.date}
        items={day.expenses}
        total={day.expenses_total}
        categories={categories}
        onChanged={onChanged}
      />

      <DayIncomeSection
        date={day.date}
        items={day.incomes}
        total={day.income_total}
        sources={sources}
        onChanged={onChanged}
      />

      <DaySleepSection date={day.date} items={day.sleep} onChanged={onChanged} />

      <DayHabitsSection date={day.date} items={day.habits} onChanged={onChanged} />

      <DayMoodSection date={day.date} />

      <DayWorkSection date={day.date} onChanged={onChanged} />

      <DaySchoolSection date={day.date} />

      <DayFitnessSection
        date={day.date}
        items={day.fitness}
        types={types}
        units={units}
        onChanged={onChanged}
      />

      <DayNotesSection
        date={day.date}
        items={day.notes}
        contacts={contacts}
        onChanged={onChanged}
      />
    </div>
  );
}
