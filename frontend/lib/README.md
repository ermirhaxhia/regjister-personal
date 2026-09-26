# lib/ — Klienti i API-t dhe ndihmësit

**Qëllimi:** Një pikë e vetme për komunikimin me FastAPI dhe për menaxhimin e sesionit.

**Përmban:**
- `api.ts` — auth: `verifyPin` (ruan token JWT te `rp_token`), `storePin/storeToken/
  getStoredPin/getStoredToken/hasSession/clearPin` (`sessionStorage rp_pin` + `rp_token`).
  Klient: `apiGet/apiPost/apiPatch/apiDelete` që vënë `Authorization: Bearer <rp_token>`
  (fallback `X-PIN`) + `Content-Type`, hedhin `ApiError(status, message)` në jo-2xx; te
  `401` pastrojnë sesionin dhe ridrejtojnë te `/`. Tipe + funksione: `getSummary`,
  `listExpenses/createExpense/updateExpense/deleteExpense`, `listIncome/createIncome/…`,
  `listSleep/createSleep/…`, `listClassSessions/createClassSession/…`,
  `getDaySchedule`, `upsertAttendance/deleteAttendance`, `getAttendanceSummary`
  (`/school/*`). URL nga `NEXT_PUBLIC_API_URL`. Sekretet nuk logohen, jo `localStorage`.
- `money.ts` — `formatALL` (247.600 L), `formatALLShort` (12k L), `formatSigned`.
- `fitnessUnits.ts` — vokabulari i njësive të aktivitetit: `UNIT_ORDER`, `UNIT_SHORT`
  (etiketa të shkurtra: hapa, km, min, kg…), `formatUnitValue` (de-DE, 2 dhjetore),
  `describeValues` ("5,2 km · 30 min" nga `values` jsonb).
- `date.ts` — data/orë shqip: `fullDate`, `dayMonth`, `monthLabel`, `timeLabel`,
  `durationLabel` (Xh Ym), `todayISO`, `toDatetimeLocal`/`fromDatetimeLocal`.
- `cn.ts` — bashkim i thjeshtë i klasave CSS.
- `useGenLoad.ts` — hook për ngarkimin fillestar të faqeve `/panel`: numërues gjeneratë
  që lejon vetëm ngarkimin e fundit të prekë state-in (mbron nga gara StrictMode +
  rikompilim dev), 1 riprovim ~500ms para `status="error"`, injoron `isAbortError`.
  Kthen `{ status, reload, refresh }`; `status` përfshin `"refreshing"` (rifreskim i
  butë, tabela mbetet e dukshme).
- `weekday.ts` — konventa e ditës së javës për modulin Shkolla: `WEEKDAY_LABELS`/
  `WEEKDAY_SHORT` (0=Hënë..6=Diel, siç kthen Python `.weekday()`), `weekdayFromISO`
  (konverton nga `Date.getDay()` JS te konventa 0-6 e projektit), `timeShort`
  ("HH:MM:SS" → "HH:MM"), `groupByWeekday` (grupim + renditje kronologjike).

**Lidhet me:** të gjithë komponentët; `Authorization: Bearer` merr token-in nga
`getStoredToken()`, me fallback `X-PIN` nga `getStoredPin()`.
