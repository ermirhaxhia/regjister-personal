# components/home/ — Kartat e faqes kryesore

**Qëllimi:** Vizualizimet e `GET /summary` në bento grid.

**Përmban:**
- `BalanceCard.tsx` — balanca totale + chip ndryshimi mujor + `Sparkline`; kur
  `forecast.ready` shton totalin ≈ / interval, ndryshe rreshtin me `reason`.
- `Sparkline.tsx` — SVG i vizatuar me dorë nga `series_30d` (pa lib grafike); prop
  opsional `forecast` shton vijën e ndërprerë dhe brezin e pasigurisë përpara.
- `AttentionList.tsx` — kartë "VËMENDJE" nga `summary.flags`; rresht me shirit ngjyre
  sipas `severity` (`warn`→danger, `info`→accent-2), ikonë sipas `module` dhe teksti.
  Bosh → `return null`.
- `SpendingStrip.tsx` — Sot / Java / Muaji me `Delta`.
- `Delta.tsx` — shigjetë + % jeshile/kuqe nga çift vlerash.
- `PaceCard.tsx` — `daily_rate` vs `daily_allowed` + shirit; prompt nëse `budget == null`.
- `PaydayCard.tsx` — unazë progresi ditësh + `projected_at_payday`.
- `HighlightRow.tsx` — shpenzimi më i madh i javës + kategoria kryesore e muajit.

**Lidhet me:** `lib/api` (tipet e `Summary`), `lib/money`, `lib/date`.
