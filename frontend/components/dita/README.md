# components/dita/ — Komponentët e Pamjes Ditore

**Qëllimi:** Ndarja e faqes `/panel/dita` në pjesë të vogla: navigimi i datës dhe
kartat për të 6 modulet e një dite.

**Përmban:**
- `DayNav.tsx` — navigimi i datës: shigjeta ◄/► (±1 ditë me `addDays`), `<input
  type="date">` (i kufizuar `max` te sot), etiketë `fullDate`, buton «Sot»
  (çaktivizuar te sot).
- `DaySection.tsx` — mbështjellës karte (`rp-card`): ikonë + titull + numërues +
  `children`; kur `isEmpty` shfaq një rresht të vogël "asgjë atë ditë"; `footer`
  opsional (totali).
- `DayRows.tsx` — rreshtat prezantues për çdo modul: `ExpenseRow`, `IncomeRow`,
  `SleepRow`, `HabitRow` (badge `IconCheck` "U mbajt" / "—" / "N min"), `FitnessRow`
  (çiftet `çelës vlerë`), `NoteRow`.
- `DayBoard.tsx` — kompozon të 6 `DaySection`; nëse të gjitha listat janë bosh shfaq
  një `EmptyState` të vetëm ("Ditë e qetë …").

**Lidhet me:** `lib/api` (`getDay`, tipet `Day*`), `lib/date`, `lib/money`,
`lib/fitnessUnits`, `components/common/States`, `components/icons`.
