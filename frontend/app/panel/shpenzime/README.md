# app/panel/shpenzime/ — Shpenzimet

**Qëllimi:** Listimi dhe menaxhimi i shpenzimeve ditore.

**Përmban:**
- `page.tsx` — listë e renditur data zbritëse, filtër sipas muajit, shto/edito/fshi
  me konfirmim. Tri gjendjet: loading, error, bosh.

**Endpoint-e:** `GET/POST /expenses`, `PATCH/DELETE /expenses/{id}`.

**Lidhet me:** `components/shpenzime/*`, `components/common/*`, `lib/api`, `lib/money`, `lib/date`.
