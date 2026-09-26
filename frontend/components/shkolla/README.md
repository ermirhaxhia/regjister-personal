# components/shkolla/ — Orari dhe prezenca e shkollës

**Qëllimi:** Komponentët e faqes `/panel/shkolla`: pamja javore e orarit fiks, lista
e ditës me shënimin e prezencës për seancë, dhe përqindjet e prezencës.

**Përmban:**
- `WeekScheduleGrid.tsx` — 7 kolona (Hënë..Diel), secila me blloqet e seancave
  aktive të asaj dite, renditur kronologjikisht. Konsumon `GET /school/sessions`.
- `DayScheduleList.tsx` — lista e seancave të planifikuara për një datë specifike
  (`GET /school/day/{d}`), me `AttendanceToggle` për secilën; klikimi thërret
  menjëherë `PUT /school/attendance/{session_id}/{date}`.
- `AttendanceToggle.tsx` — dy gjendje "Shkova" / "S'shkova" (jo binar `null`
  fillimisht, por zgjedhje eksplicite pas klikimit).
- `AttendanceSummaryList.tsx` — përqindja e prezencës për çdo lëndë/seancë nga
  `GET /school/attendance/summary` (pa `session_id`).

**Lidhet me:** `lib/api`, `lib/weekday`, `lib/useGenLoad`, `components/common/*`.
