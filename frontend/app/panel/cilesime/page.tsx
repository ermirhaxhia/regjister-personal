"use client";

import type { ComponentType } from "react";
import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import Sheet from "@/components/common/Sheet";
import {
  IconReceipt,
  IconBanknote,
  IconMoon,
  IconHabits,
  IconActivity,
  IconUsers,
} from "@/components/icons";
import ModuleCard from "@/components/cilesime/ModuleCard";
import OpeningBalanceCard from "@/components/cilesime/OpeningBalanceCard";
import PinChangeCard from "@/components/cilesime/PinChangeCard";
import ActivityTypeManager from "@/components/cilesime/ActivityTypeManager";
import HabitManager from "@/components/cilesime/HabitManager";
import ExpenseCategoryManager from "@/components/cilesime/ExpenseCategoryManager";
import IncomeSourceManager from "@/components/cilesime/IncomeSourceManager";
import SleepGoalForm from "@/components/cilesime/SleepGoalForm";
import WorkplaceManager from "@/components/hr/WorkplaceManager";

type SheetKind =
  | "hr"
  | "activity"
  | "habits"
  | "expenses"
  | "income"
  | "sleep"
  | "soon";

interface ModuleDef {
  key: string;
  name: string;
  description: string;
  icon: ComponentType<{ size?: number }>;
  kind: SheetKind;
  active: boolean;
}

const MODULES: ModuleDef[] = [
  {
    key: "hr",
    name: "Burime Njerëzore",
    description: "Vendet e punës & kontaktet",
    icon: IconUsers,
    kind: "hr",
    active: true,
  },
  {
    key: "activity",
    name: "Aktivitet Fizik",
    description: "Llojet e aktivitetit & njësitë",
    icon: IconActivity,
    kind: "activity",
    active: true,
  },
  {
    key: "expenses",
    name: "Shpenzime",
    description: "Kategoritë e shpenzimeve",
    icon: IconReceipt,
    kind: "expenses",
    active: true,
  },
  {
    key: "income",
    name: "Të ardhura",
    description: "Burimet, ndarja 50/50",
    icon: IconBanknote,
    kind: "income",
    active: true,
  },
  {
    key: "sleep",
    name: "Gjumi",
    description: "Synimi i orëve, kujtues",
    icon: IconMoon,
    kind: "sleep",
    active: true,
  },
  {
    key: "habits",
    name: "Zakone",
    description: "Zakonet & lloji i ndjekjes",
    icon: IconHabits,
    kind: "habits",
    active: true,
  },
];

const SHEET_TITLE: Record<SheetKind, string> = {
  hr: "Burime Njerëzore",
  activity: "Aktivitet Fizik",
  habits: "Zakone",
  expenses: "Shpenzime",
  income: "Të ardhura",
  sleep: "Gjumi",
  soon: "Së shpejti",
};

export default function SettingsPage() {
  const [sheet, setSheet] = useState<SheetKind | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-3.5 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-1.5">
        <PageHeader title="Cilësime" />
        <p className="text-[13px] text-text-lo">
          Çdo modul ka gjërat që i rregullon vetë. Kliko «Modifiko».
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <ModuleCard
            key={m.key}
            icon={m.icon}
            name={m.name}
            description={m.description}
            active={m.active}
            onModify={() => setSheet(m.kind)}
          />
        ))}
      </div>

      <OpeningBalanceCard />

      <PinChangeCard />

      <Sheet
        open={sheet !== null}
        title={sheet ? SHEET_TITLE[sheet] : ""}
        onClose={() => setSheet(null)}
      >
        {sheet === "hr" && <WorkplaceManager bare />}
        {sheet === "activity" && <ActivityTypeManager />}
        {sheet === "habits" && <HabitManager bare />}
        {sheet === "expenses" && <ExpenseCategoryManager bare />}
        {sheet === "income" && <IncomeSourceManager bare />}
        {sheet === "sleep" && <SleepGoalForm bare />}
        {sheet === "soon" && (
          <p className="text-sm text-text-mid">
            Së shpejti — do t&apos;i shtojmë bashkë.
          </p>
        )}
      </Sheet>
    </div>
  );
}
