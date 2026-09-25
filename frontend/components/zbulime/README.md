# components/zbulime/ — Komponentët e faqes Zbulime

**Qëllimi:** Paraqitja e lidhjeve mes moduleve që kthen `GET /insights`.

**Përmban:**
- `InsightCard.tsx` — `rp-card` për një `Insight`: ikonë sipas `kind`
  (`sleep_spend→IconMoon`, `weekday_spend→IconReceipt`, `payday_window→IconBanknote`,
  `fitness_habits→IconActivity`), `title` i theksuar, `detail` në `text-text-mid`, dhe
  një etiketë besueshmërie (pikë ngjyre + tekst: e ulët/gri, mesatare/accent,
  e lartë/success) plus `{data_points} pika` në mono.
- `CorrelationMatrix.tsx` — matricë e `GET /insights/correlations` (rreshta:
  energjia/humori/shpenzimi/zakonet e nesërmes; kolona: gjumi/orë pune/shpenzimi
  i sotëm). Qelizat ngjyrosen sipas shenjës së `rho` (accent-2 pozitiv, danger
  negativ), me `n` poshtë dhe `IconSpark` kur `significant`. Kur `cells` është
  bosh (rasti aktual, <30 ditë të mbivendosura) shfaq një `EmptyState` të
  vetëm në vend të matricës.

**Lidhet me:** `lib/api` (`Insight`, `CorrelationCell`, `getCorrelations`),
`lib/cn`, `lib/useGenLoad`, `components/icons`, `components/common/States`.
