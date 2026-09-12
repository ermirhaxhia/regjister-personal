# app/panel/burime-njerezore/[workplaceId]/[contactId]/ — Karta e kontaktit

**Qëllimi:** Profili i një kontakti + shënimet e takimeve.

**Përmban:**
- `page.tsx` — ngarkon `getContact(contactId)` + `listWorkplaces()`. Shfaq
  `ContactProfile`; "Lexo më shumë" hap përshkrimin dhe vetëm atëherë shfaqet
  `ContactNotes`. "Ndrysho profilin" → `ContactSheet` (vendi i zgjedhshëm).
  "Fshi kontaktin" → `Confirm` (paralajmëron edhe shënimet) → kthim te vendi.

**Lidhet me:** `components/hr/ContactProfile`, `components/hr/ContactNotes`,
`components/hr/ContactSheet`, `components/hr/Breadcrumb`, `components/common/*`,
`lib/api`.
