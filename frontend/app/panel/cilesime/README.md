# app/panel/cilesime/ — Cilësime

**Qëllimi:** Një pikë e vetme ku çdo modul rregullon gjërat e veta.

**Përmban:**
- `page.tsx` — grid 2×3 me `ModuleCard` (Burime Njerëzore, Aktivitet Fizik, Shpenzime,
  Të ardhura, Gjumi, Zakone — të gjitha aktive). "Modifiko" hap një `Sheet`: Burime
  Njerëzore → `WorkplaceManager`; Aktivitet Fizik → `ActivityTypeManager`; Shpenzime →
  `ExpenseCategoryManager`; Të ardhura → `IncomeSourceManager`; Gjumi → `SleepGoalForm`;
  Zakone → `HabitManager`. Poshtë grid-it: `PinChangeCard` (vetëm dizajn).
  `max-w-[1400px]`, 3→2→1 kolona.

**Endpoint-e:** përmes menaxherëve — `/workplaces`, `/activity-types` (+ `/units`),
`/expense-categories`, `/income-sources`, `/settings/sleep-goal`, `/habits`.

**Lidhet me:** `components/common/PageHeader`, `components/common/Sheet`,
`components/cilesime/*`, `components/hr/WorkplaceManager`, `components/icons`.
