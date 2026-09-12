# components/common/ — Primitivat e përbashkët të UI-t

**Qëllimi:** Blloqe të ripërdorshme nëpër faqet e panelit.

**Përmban:**
- `Sheet.tsx` — modal në desktop / bottom-sheet në mobile (`framer-motion`, scrim, Esc, scroll-lock).
- `Confirm.tsx` — dialog konfirmimi para fshirjes (mbi `Sheet`).
- `Field.tsx` — `Field` (etiketë+hint+error), `inputClass`, `SubmitRow` (Anulo/Ruaj).
- `States.tsx` — `LoadingBlock`, `ErrorState`, `EmptyState`.
- `PageHeader.tsx` — header i desktopit: titull + meta + buton veprimi.

**Lidhet me:** `components/icons`, `lib/cn`.
