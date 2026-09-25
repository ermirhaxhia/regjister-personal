# app/panel/ore-pune/ — Faqja Orë Pune

**Qëllimi:** Regjistrimi manual i seancave të punës (fillim/mbarim, vend pune opsional,
shënim), me krye statistikor për 7 ditët e fundit.

**Përmban:** `page.tsx` — listë (`GET /work-sessions`), shto/edito/fshi seancash, krye
me `WorkSummaryStrip` (`GET /work-sessions/summary`).

**Lidhet me:** `components/ore-pune/*`, `components/common/*`,
`components/shell/ShellContext`, `lib/api`, `lib/date`.
