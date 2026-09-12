# Frontend — Regjistri Personal

**Qëllimi:** Ndërfaqja Next.js (App Router) për regjistrin personal — jo publike,
akses me PIN. Vetëm klient; të dhënat kalojnë përmes API-t të FastAPI.

**Përmban:**
- `app/` — rrugët (App Router): `/` ekrani i PIN-it, `/panel` placeholder pas hyrjes.
- `components/` — komponentët React të përbashkët (ekrani i hyrjes, tastiera, ikonat).
- `lib/` — klienti i vetëm i API-t (`api.ts`) dhe ndihmësit.
- `app/globals.css` — design tokens (`@theme`) + fontet.

**Lidhet me:** FastAPI te `NEXT_PUBLIC_API_URL` (shih `.env.example`), endpoint
`POST /auth/verify`. PIN-i mbahet vetëm në `sessionStorage` (`rp_pin`), asnjëherë i loguar.

**Nisja:** `cd frontend && npm install && npm run dev` → http://localhost:3000
