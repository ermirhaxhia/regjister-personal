# app/panel/ — Zona pas hyrjes

**Qëllimi:** Shtrati i aplikacionit (sidebar/drawer) + faqja kryesore + faqet e moduleve.

**Përmban:**
- `layout.tsx` — mbështjell çdo faqe me `components/shell/Shell` (roje sesioni + navigim).
- `page.tsx` — Faqja kryesore; konsumon `GET /summary` (balancë, ritëm, deri te paga, highlights).
- `dita/` — Pamja Ditore; konsumon `GET /day/{YYYY-MM-DD}` (të 6 modulet për një ditë).
- `zbulime/` — Zbulime mes moduleve; konsumon `GET /insights` (bosh derisa ka histori).
- `dashboard/` — Grafikë 30-ditorë (devijim shpenzimesh, kategori, shpenzime vs. të
  ardhura); konsumon `GET /dashboard`.
- `shpenzime/`, `te-ardhura/`, `gjumi/`, `zakone/`, `aktivitet/` — faqet e moduleve
  (listë + shto/edito/fshi).
- `burime-njerezore/` — CRM personal kontaktesh: vende → kontakte → karta + shënime.
- `cilesime/` — preferencat; menaxhimi i vendeve të punës.

**Lidhet me:** `lib/api` (summary + CRUD), `components/shell/*`, `components/common/*`,
`components/home/*`, `components/<modul>/*`. Roje klienti: pa `rp_pin` → `/`.
