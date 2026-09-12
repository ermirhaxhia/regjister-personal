# app/panel/burime-njerezore/ — Burime Njerëzore (CRM personal)

**Qëllimi:** Kontakte pune të grupuara sipas vendit të punës, me shënime faktike
për çdo takim/bisedë. Vetëm info profesionale.

**Përmban:**
- `page.tsx` — lista e VENDEVE (`GET /workplaces`): kartë me emër + `contact_count`;
  klik → `[workplaceId]`. Bosh → link te Cilësimet.
- `[workplaceId]/page.tsx` — lista e KONTAKTEVE të vendit (`GET /contacts?workplace_id=`):
  tabelë `table-fixed` / karta në mobile, kërkim sipas emrit, fletë "＋ Kontakt".
- `[workplaceId]/[contactId]/page.tsx` — karta e kontaktit: profil, "Ndrysho profilin"
  (fletë), "Lexo më shumë" (përshkrimi), dhe pasi hapet — seksioni i shënimeve.

**Endpoint-e:** `GET/POST /workplaces`, `GET /contacts`, `GET/POST/PATCH/DELETE
/contacts/{id}`, `GET/POST/PATCH/DELETE /contacts/{id}/notes`.

**Lidhet me:** `components/hr/*`, `components/common/*`, `components/shell/ShellContext`,
`lib/api`, `lib/date`.
