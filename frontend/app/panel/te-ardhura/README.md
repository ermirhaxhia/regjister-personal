# app/panel/te-ardhura/ — Të ardhurat

**Qëllimi:** Listimi i pagave mujore dhe ndarja 50/50 personale/familje.

**Përmban:**
- `page.tsx` — kartat e pagave (muaji, data e marrjes, shuma) me dy shirita alokimi,
  shto/edito/fshi me konfirmim. Burimi zgjidhet nga burimet e ruajtura. Tri gjendjet.

**Endpoint-e:** `GET/POST /income`, `PATCH/DELETE /income/{id}` (GET kthen `allocations[]`),
`GET/POST/PATCH/DELETE /income-sources`.

**Lidhet me:** `components/te-ardhura/*`, `components/common/*`, `lib/api`, `lib/money`, `lib/date`.
