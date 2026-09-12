import type { DayView } from "@/lib/api";
import { formatALL } from "@/lib/money";
import { EmptyState } from "@/components/common/States";
import {
  IconActivity,
  IconBanknote,
  IconHabits,
  IconMoon,
  IconReceipt,
  IconUsers,
} from "@/components/icons";
import DaySection from "@/components/dita/DaySection";
import {
  ExpenseRow,
  FitnessRow,
  HabitRow,
  IncomeRow,
  NoteRow,
  SleepRow,
} from "@/components/dita/DayRows";

function isDayEmpty(day: DayView): boolean {
  return (
    day.expenses.length === 0 &&
    day.incomes.length === 0 &&
    day.sleep.length === 0 &&
    day.habits.length === 0 &&
    day.fitness.length === 0 &&
    day.notes.length === 0
  );
}

function TotalFooter({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-lo">
        {label}
      </span>
      <span className="font-mono text-[13px] font-semibold text-text-hi">
        {formatALL(value)}
      </span>
    </div>
  );
}

export default function DayBoard({ day }: { day: DayView }) {
  if (isDayEmpty(day)) {
    return (
      <EmptyState title="Ditë e qetë — asgjë e regjistruar për këtë ditë" />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DaySection
        icon={IconReceipt}
        title="Shpenzime"
        accent="orange"
        count={day.expenses.length}
        isEmpty={day.expenses.length === 0}
        footer={<TotalFooter label="Gjithsej" value={day.expenses_total} />}
      >
        {day.expenses.map((e) => (
          <ExpenseRow key={e.id} item={e} />
        ))}
      </DaySection>

      <DaySection
        icon={IconBanknote}
        title="Të ardhura"
        accent="orange"
        count={day.incomes.length}
        isEmpty={day.incomes.length === 0}
        footer={<TotalFooter label="Gjithsej" value={day.income_total} />}
      >
        {day.incomes.map((i) => (
          <IncomeRow key={i.id} item={i} />
        ))}
      </DaySection>

      <DaySection
        icon={IconMoon}
        title="Gjumi"
        accent="violet"
        count={day.sleep.length}
        isEmpty={day.sleep.length === 0}
      >
        {day.sleep.map((s) => (
          <SleepRow key={s.id} item={s} />
        ))}
      </DaySection>

      <DaySection
        icon={IconHabits}
        title="Zakone"
        accent="violet"
        count={day.habits.length}
        isEmpty={day.habits.length === 0}
      >
        {day.habits.map((h) => (
          <HabitRow key={h.id} item={h} />
        ))}
      </DaySection>

      <DaySection
        icon={IconActivity}
        title="Aktivitet"
        accent="orange"
        count={day.fitness.length}
        isEmpty={day.fitness.length === 0}
      >
        {day.fitness.map((f) => (
          <FitnessRow key={f.id} item={f} />
        ))}
      </DaySection>

      <DaySection
        icon={IconUsers}
        title="Shënime"
        accent="violet"
        count={day.notes.length}
        isEmpty={day.notes.length === 0}
      >
        {day.notes.map((n) => (
          <NoteRow key={n.id} item={n} />
        ))}
      </DaySection>
    </div>
  );
}
