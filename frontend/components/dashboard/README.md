# components/dashboard/ — Grafikët e faqes Dashboard

**Qëllimi:** Vizualizime SVG të vizatuara me dorë mbi `GET /dashboard`, pa libra
grafikësh.

**Përmban:**
- `DeviationChart.tsx` — pika për shpenzimin e çdo dite (30 ditë) kundrejt
  `expense_mean_30d`; vijë horizontale e ndërprerë te mesatarja; ngjyra/madhësia e
  pikës sipas largësisë nga mesatarja (portokalli mbi mesatare, gri nën).
- `CategoryDonut.tsx` — donut me `stroke-dasharray` mbi `categories_month`, grupim
  automatik nën "Të tjera" përtej 6 kategorive, legjendë me pikë ngjyre + %.
- `IncomeExpenseChart.tsx` — dy seri (shpenzime/zonë portokalli, të ardhura/vijë
  vjollcë e ndërprerë) mbi të njëjtin bosht 30-ditor, si `Sparkline`.
- `KpiTiles.tsx` — tre pllaka KPI (norma e kursimit, runway, plotësia e
  regjistrimit) mbi fushat e reja të `GET /dashboard`; trajtojnë vlerat `null`.
- `SleepWindowChart.tsx` — dritarja e gjumit për 14 net (`GET /sleep/insights`):
  vijë vertikale bedtime→waketime për natë mbi bosht orësh 19:00→08:00, brez
  ±1 std rreth orës mesatare të fjetjes.
- `SleepDebtChart.tsx` — borxhi kumulativ i gjumit nëpër net, si `DeviationChart`
  por me vijë zero dhe ngjyrë vjollcë.
- `ExpenseHeatmap.tsx` — heatmap kalendarik stil GitHub mbi
  `GET /dashboard/expense-heatmap`, ngjyrosje me kuantile (20/40/60/80) mbi
  ditët me shpenzim > 0.

**Lidhet me:** `lib/api` (`DashboardRead`, `DashboardDay`, `CategoryShare`,
`SavingsRateMonth`, `SleepInsightsRead`, `ExpenseHeatmapRead`), `lib/money`,
`lib/date`, `lib/cn`.
