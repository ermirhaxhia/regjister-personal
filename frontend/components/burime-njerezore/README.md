# components/burime-njerezore/ — Pamje agregate mbi kontaktet

**Qëllimi:** Komponentë që kombinojnë kontaktet nga të gjitha vendet e punës, pa u
kufizuar te një vend i vetëm (ndryshe nga `components/hr/`).

**Përmban:**
- `ColdContactsSection.tsx` — kolegët e gjithë sektorëve, renditur sipas ditëve nga
  `last_note_date` (zbritëse; pa shënim ndonjëherë → "asnjëherë", në krye). Shirit
  proporcional + ngjyrë sipas pragjeve 21/45 ditë. Përdoret te
  `app/panel/burime-njerezore/page.tsx`.

**Lidhet me:** `lib/api` (`listContacts`, `listWorkplaces`), `lib/date` (`daysSince`),
`components/hr/ContactsTable` (`fullName`), `components/common/States`.
