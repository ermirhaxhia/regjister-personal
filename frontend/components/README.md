# components/ — Komponentët e përbashkët

**Qëllimi:** Komponentë React të ripërdorshëm, të pavarur nga rruga.

**Përmban:**
- `PinScreen.tsx` — orkestron gjendjen e PIN-it (input, tastierë fizike, thirrje API, ridrejtim).
- `PinCard.tsx` — karta e hyrjes (etiketë, titull, pika, rresht gabimi, tastierë); prezantuese.
- `PinDots.tsx` — 4 pikat që mbushen (accent i ngurtë); të kuqe + shake në gabim.
- `PinKeypad.tsx` — tastiera numerike custom (hit-target ≥ 44px).
- `EntrySidebar.tsx` — paneli majtas vetëm në desktop (mark + emër + data e sotme).
- `icons.tsx` — SVG line-icons (grid 24, stroke 1.7, round). Kurrë emoji.
- `shell/` — shtrati i `/panel` (sidebar, drawer mobil, konteksti i navigimit).
- `common/` — primitivat e përbashkët (Sheet, Confirm, Field, States, PageHeader).
- `home/` — kartat e faqes kryesore (balancë, sparkline, ritëm, deri te paga).
- `shpenzime/`, `te-ardhura/`, `gjumi/`, `zakone/`, `aktivitet/` — komponentët e
  secilit modul (listë + fletë).
- `cilesime/` — kartat e moduleve + menaxherët (lloje aktiviteti) të faqes Cilësime.

**Lidhet me:** `lib/api` (verifikimi + sesioni + CRUD), `lib/cn` (bashkim klasash).
