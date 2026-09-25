# app/panel/dita/ — Pamja Ditore

**Qëllimi:** Një ekran i vetëm, i edituar, për gjithçka të një dite nga të 6 modulet
(shpenzime, të ardhura, gjumë, zakone, aktivitet, shënime kolegësh) — shto/ndrysho/fshi
pa dalë nga faqja, çdo ndryshim ruhet menjëherë ndaj tabelës përkatëse si kudo tjetër.

**Përmban:**
- `page.tsx` — gjendja `date` (fillon `todayISO()`), ngarkimi me `useGenLoad(getDay)`
  që rimekohet kur `date` ndryshon; tri gjendjet (ngarkim / gabim / gati); `refresh()`
  i kalohet `DayBoard` si `onChanged` për t'u thirrur pas çdo mutacioni (rifreskim i
  butë, pa e zhdukur pamjen). Header `PageHeader title="Dita"` + `DayNav`.

**Lidhet me:** `lib/api` (`GET /day/{YYYY-MM-DD}` → `DayView`), `lib/date`
(`todayISO`, `addDays`), `components/dita/*`, `components/common/*`.
