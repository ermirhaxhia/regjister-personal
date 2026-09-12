# app/panel/zakone/ — Zakone

**Qëllimi:** Ndjekja e zakoneve si tabelë e qartë; shënim i sotëm binar ose me minuta.

**Përmban:**
- `page.tsx` — ngarkon `getHabitsGrid(days)` + `listHabits(false)`. Tabela e zakoneve
  (`HabitsTable`, toggle 14/30), shënim optimist i qelizës së sotme, seksioni
  "Arkivuar", fletë shto/edito, fshirje me konfirmim (paralajmëron cascade).
  Gjendja bosh shfaqet vetëm kur s'ka zakone aktive DHE s'ka të arkivuar; nëse ka
  vetëm të arkivuar → nxitje + seksioni "Arkivuar".

**Endpoint-e:** `GET /habits`, `GET /habits/grid`, `POST /habits`, `PATCH/DELETE /habits/{id}`,
`PUT/DELETE /habits/{id}/log/{entry_date}`.

**Lidhet me:** `components/zakone/*`, `components/common/*`, `components/shell/ShellContext`,
`lib/api`, `lib/date`.
