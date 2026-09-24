# components/zakone/ — Komponentët e modulit Zakone

**Qëllimi:** Tabela ditore e zakoneve dhe shënimi i sotëm. Krijimi/riemërtimi/
arkivimi i zakoneve rri te Cilësimet (`components/cilesime/HabitManager`).

**Përmban:**
- `HabitsTable.tsx` — orkestron shënimin optimist (binar/kohëzgjatje) + rifreskim në
  sfond; toggle 14/30; legjendë inline (mbajtur / pa shënim / sot); në desktop
  `<table>` (`HabitTableRow`), në mobile karta të stivosura (`HabitMobileCard`).
  Eksporton `recomputeRow`.
- `HabitTableRow.tsx` / `HabitMobileCard.tsx` — një zakon: emër, "Sot", "Seria",
  "Mbajtur", "Historiku" (pa veprim editimi — bëhet te Cilësimet).
- `HabitHistory.tsx` — rrip qelizash për ditët; kokë shkronjash (H·M·M·E·P·Sh·D) sipër,
  numri i ditës së muajit brenda çdo kutie (shkurtim muaji te dita 1 në desktop), data
  e plotë si `title`; skroll horizontal vetëm brenda rripit.
- `TodayControl.tsx` — checkbox i madh (binar), input minuta (kohëzgjatje), ose
  link "Lexim →" te `/panel/zakone/lexim` (tracking_type `lexim`, ku menaxhohen
  librat dhe sesionet).
- `HabitCells.tsx` — `HabitName`, `StreakBadge` (flame kur ≥ 3), `RateBar`
  ("{mbajtur} / {gjithsej} ditë" + mini-shirit).
- `DurationMark.tsx` — input minuta (blur/Enter).
- `HabitSheet.tsx` — fletë shto/edito në `Sheet`; përdoret nga `HabitManager` te Cilësimet.
- `ArchivedHabits.tsx` — seksion i palosur me ri-aktivizim / fshirje; përdoret nga
  `HabitManager` te Cilësimet.

**Lidhet me:** `components/common/*`, `components/cilesime/HabitManager`, `lib/api`,
`lib/date`, `lib/useGenLoad`.
