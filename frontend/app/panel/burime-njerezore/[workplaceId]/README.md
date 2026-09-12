# app/panel/burime-njerezore/[workplaceId]/ — Kontaktet e një vendi pune

**Qëllimi:** Lista e kontakteve që i takojnë një vendi pune + krijimi i kontaktit.

**Përmban:**
- `page.tsx` — ngarkon `listWorkplaces()` (për emrin/validim) + `listContacts(workplaceId)`.
  Breadcrumb, kërkim klienti sipas emrit, `ContactsTable`, fletë `ContactSheet`
  me `sector_id` të fiksuar te ky vend. Klik rresht → `[contactId]`.

**Lidhet me:** `components/hr/ContactsTable`, `components/hr/ContactSheet`,
`components/hr/Breadcrumb`, `lib/api`, `lib/date`.
