# components/shell/ — Shtrati i aplikacionit

**Qëllimi:** Navigimi dhe korniza rreth faqeve të `/panel`.

**Përmban:**
- `Shell.tsx` — roje sesioni, gjendja e sidebar-it (`localStorage rp_sidebar`), layout; kolona qendrore është kontejneri i skrollit (`overflow-y-auto`).
- `Sidebar.tsx` — rail-i i desktopit (≥1024px), hapet 236px / mbyllet 64px me `framer-motion`.
- `MobileNav.tsx` — top bar `sticky top-0 z-30` (<1024px) + drawer nga e majta, scrim, Esc, bllokim scroll-i.
- `nav.ts` — zërat e navigimit, titulli i faqes, gjendja aktive.
- `ShellContext.tsx` — numëratorët e moduleve + regjistrimi i veprimit `＋` për top bar-in.

**Lidhet me:** `lib/api` (numëratorë + logout), `components/icons`, `lib/cn`.
