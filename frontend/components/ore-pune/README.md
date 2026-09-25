# components/ore-pune/ — Komponentët e modulit Orë Pune

**Qëllimi:** Listimi i seancave të punës (regjistrim manual fillim/mbarim) dhe forma
e shtim/redaktimit.

**Përmban:**
- `WorkSessionRow.tsx` — rreshta me `work_date`, fillim→fund në orë lokale,
  kohëzgjatje `Xh Ym`, vendi i punës (nëse ka), shënon datat kur seanca kalon mesnatën.
- `WorkSessionSheet.tsx` — formë shto/edito në `Sheet` me `datetime-local`; select
  opsional për `workplace_id` (nga `listWorkplaces`); validim `mbarimi > fillimi`;
  `work_date` lihet bosh (backend e nxjerr).
- `WorkSummaryStrip.tsx` — 3 pllaka KPI: orë gjithsej, ditë të punuara, mesatare/ditë
  për 7 ditët e fundit, nga `GET /work-sessions/summary`.

**Lidhet me:** `components/common/*`, `components/shell/ShellContext`, `lib/api`,
`lib/date`.
