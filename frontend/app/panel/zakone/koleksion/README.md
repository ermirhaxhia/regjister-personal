# app/panel/zakone/koleksion/ — Koleksione progresi

**Qëllimi:** Menaxhimi i koleksioneve (progres total+increment) të një zakoni të
tipit `koleksion` specifik — p.sh. libra, ushtrime, projekte.

**Përmban:**
- `[habitId]/page.tsx` — listë koleksionesh të atij zakoni, të grupuara Aktive /
  Në pauzë / Të përfunduara; krijim, redaktim (emër/total/status), fshirje.
- `[habitId]/[collectionId]/page.tsx` — detaj koleksioni: progres (fshihet nëse
  `total_amount` mungon), ritmi/parashikimi (vetëm kur backend-i i jep), listë
  hyrjesh me shtim/fshirje.

**Endpoint-e:** `GET/POST /habits/{habitId}/collections`, `GET/PATCH/DELETE
/collections/{id}`, `GET/POST /collections/{id}/entries`,
`PATCH/DELETE /collections/{id}/entries/{entryId}`.

**Lidhet me:** `components/koleksion/*`, `components/common/*`, `lib/api`,
`lib/date`.
