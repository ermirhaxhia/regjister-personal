# app/panel/dashboard/ — Dashboard

**Qëllimi:** Pamje grafike e shpenzimeve/të ardhurave mbi 30 ditët e fundit, e
nxjerrë drejtpërdrejt nga `GET /dashboard`.

**Përmban:**
- `page.tsx` — ngarkon (`useGenLoad`) `getDashboard()`. Header `PageHeader
  "Dashboard"` + nën-rresht shpjegues. Tri gjendjet: loading (`LoadingBlock`),
  error (`ErrorState` + `reload`), bosh (`EmptyState` kur çdo ditë ka
  shpenzim/të ardhur 0). Përndryshe: grid `lg:grid-cols-2` me devijimin ditor
  dhe donut-in e kategorive, plus grafiku i plotë shpenzime/të ardhura poshtë.

**Endpoint-e:** `GET /dashboard` → `{ daily, expense_mean_30d, categories_month }`.

**Lidhet me:** `components/dashboard/*`, `components/common/*`, `lib/api`,
`lib/useGenLoad`.
