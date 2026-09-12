# app/panel/dita/ — Pamja Ditore

**Qëllimi:** Një ditar që tregon gjithçka të një dite nga të 6 modulet
(shpenzime, të ardhura, gjumë, zakone, aktivitet, shënime kolegësh).

**Përmban:**
- `page.tsx` — gjendja `date` (fillon `todayISO()`), ngarkimi me `useGenLoad(getDay)`
  që rimekohet kur `date` ndryshon; tri gjendjet (ngarkim / gabim / gati) + rifreskim
  i butë kur ndërron data. Header `PageHeader title="Dita"` + `DayNav`.

**Lidhet me:** `lib/api` (`GET /day/{YYYY-MM-DD}` → `DayView`), `lib/date`
(`todayISO`, `addDays`), `components/dita/*`, `components/common/*`.
