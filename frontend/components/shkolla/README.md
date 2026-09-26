# components/shkolla/ — Orari dhe prezenca e shkollës

**Qëllimi:** Komponentët e faqes `/panel/shkolla`: pamja javore e orarit fiks, lista
e ditës me shënimin e prezencës për seancë, dhe përqindjet e prezencës.

**Përmban:**
- `WeekScheduleGrid.tsx` — tabelë orari tip "Excel": kolona vetëm për ditët me
  seancë aktive, rreshta për çdo orë (intervali llogaritet nga min/max e
  `start_time`/`end_time`), blloqet e lëndëve pozicionohen me `top%`/`height%`
  brenda kolonës sipas minutave reale. Konsumon `GET /school/sessions`.
- `ScheduleBlock.tsx` — një bllok lënde brenda kolonës (emër, lloj, orar,
  sallë/profesor nëse ka vend).
- `scheduleColors.ts` — `colorForSubject()` (hash i emrit → indeks në
  `SUBJECT_PALETTE`, e njëjta paletë si `CategoryDonut`) dhe `timeToMinutes()`.
- `DayScheduleList.tsx` — lista e seancave të planifikuara për një datë specifike
  (`GET /school/day/{d}`), me `AttendanceToggle` për secilën; klikimi thërret
  menjëherë `PUT /school/attendance/{session_id}/{date}`.
- `AttendanceToggle.tsx` — dy gjendje "Shkova" / "S'shkova" (jo binar `null`
  fillimisht, por zgjedhje eksplicite pas klikimit).
- `AttendanceSummaryList.tsx` — përqindja e prezencës për çdo lëndë/seancë nga
  `GET /school/attendance/summary` (pa `session_id`).

**Lidhet me:** `lib/api`, `lib/weekday`, `lib/useGenLoad`, `components/common/*`.
