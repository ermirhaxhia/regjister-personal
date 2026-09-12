# app/panel/aktivitet/ — Aktivitet Fizik

**Qëllimi:** Ndjekja e aktivitetit fizik sipas llojeve që i krijon vetë përdoruesi
(Ecje, Vrapim, Palestër…), secili me 1+ njësi matëse dhe synim ditor opsional.

**Përmban:**
- `page.tsx` — ngarkon (`useGenLoad`) `getFitnessSummary(30)` + `listActivityTypes()`
  + `listFitnessEntries()` + `listUnits()`. Pa buton shtimi lart. Gjendje bosh kur
  s'ka lloje → link te Cilësimet. Një grid `ActivityCard` për çdo lloj (me/pa synim);
  klik mbi kartë → `EntryModal` për atë lloj. Tabela e plotë e hyrjeve poshtë
  (`EntriesTable`); lapsi → `EntryModal` i parambushur, koshi → `Confirm`.
  Shto/edito/fshi optimist + rifreskim i `summary`. Tri gjendjet.

**Endpoint-e:** `GET /fitness/summary`, `GET /fitness/entries`,
`POST /fitness/entries`, `PATCH /fitness/entries/{id}`, `DELETE /fitness/entries/{id}`,
`GET /activity-types`, `GET /activity-types/units`.

**Lidhet me:** `components/aktivitet/*`, `components/common/*`,
`components/shell/ShellContext`, `lib/api`, `lib/date`, `lib/fitnessUnits`.
