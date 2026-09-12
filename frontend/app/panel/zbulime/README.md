# app/panel/zbulime/ — Zbulime

**Qëllimi:** Tregon lidhje mes moduleve (gjumi↔paraja, ditë jave, dritarja e pagës,
stërvitje↔zakone) të llogaritura nga backend-i.

**Përmban:**
- `page.tsx` — ngarkon (`useGenLoad`) `getInsights()`. Header `PageHeader "Zbulime"` +
  nën-rresht shpjegues. Kur `!enough_data` ose lista bosh → `EmptyState`
  ("Ende pak të dhëna…"). Përndryshe grid `lg:grid-cols-2` me `InsightCard`.
  Tri gjendjet: loading (`LoadingBlock`), error (`ErrorState` + `reload`), bosh.

**Endpoint-e:** `GET /insights` → `{ insights: Insight[], enough_data: boolean }`.

**Lidhet me:** `components/zbulime/*`, `components/common/*`, `lib/api`,
`lib/useGenLoad`.
