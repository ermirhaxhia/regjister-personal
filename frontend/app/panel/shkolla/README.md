# app/panel/shkolla/ — Faqja "Shkolla"

**Qëllimi:** Pamje javore e orarit fiks + navigim ditë-për-ditë me shënimin e
prezencës për secilën seancë + përqindjet e prezencës sipas lëndës.

**Përmban:** `page.tsx` — full-width (`max-w-[1400px]`); kompozon
`WeekScheduleGrid`, `DayNav` + `DayScheduleList`, `AttendanceSummaryList`.

**Lidhet me:** `components/shkolla/*`, `components/dita/DayNav`, `lib/date`,
`lib/api` (`/school/*`).
