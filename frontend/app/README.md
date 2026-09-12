# app/ — Rrugët (App Router)

**Qëllimi:** Faqet dhe layout-i rrënjë i aplikacionit.

**Përmban:**
- `layout.tsx` — html/body, fontet (Space Grotesk, IBM Plex Sans/Mono), metadata.
- `globals.css` — `@import "tailwindcss"` + design tokens te `@theme` + animacione.
- `page.tsx` — ekrani i PIN-it; ridrejton te `/panel` nëse `rp_pin` ekziston.
- `panel/` — zona pas hyrjes: shtrati + faqja kryesore + modulet (shpenzime, të ardhura, gjumi).

**Lidhet me:** `components/PinScreen` për hyrjen, `components/shell/*` për shtratin, `lib/api`.
