# app/panel/shpenzime/shpejt/ — Shto shpejt

**Qëllimi:** Faqe "quick action" për shtimin e shpejtë e rreshtave shpenzimesh nga
telefoni (shkurtore PWA `manifest.ts` → `/panel/shpenzime/shpejt`).

**Përmban:**
- `page.tsx` — vetëm shumë + kategori (parazgjedhje: kategoria e fundit e përdorur) +
  përshkrim opsional. Pas ruajtjes, fshin fushat dhe rifokuson inputin e shumës (pa
  redirect), për të shtuar disa shpenzime rresht pas rreshti.

**Layout i qëllimshëm i ndryshëm:** kjo faqe përdor kontejner të ngushtë e të
qendërzuar (`max-w-md`, `min-h-dvh` i qendërzuar vertikalisht) — ndryshe nga rregulli
"full-width" i pjesës tjetër të app-it — sepse është ekran i vetëm veprimi për
përdorim me një dorë në telefon, jo faqe normale navigimi.

**Endpoint-e:** `GET /expense-categories`, `GET /expenses` (për kategorinë e fundit),
`POST /expenses`.

**Lidhet me:** `lib/api`, `lib/date`, `components/common/Field` (`inputClass`).
