# components/hr/ — Komponentët e modulit Burime Njerëzore

**Qëllimi:** Kartat e vendeve, lista e kontakteve, karta e kontaktit, shënimet dhe
menaxheri i vendeve te Cilësimet.

**Përmban:**
- `WorkplaceCard.tsx` — kartë vendi pune: emër + `contact_count`, link te kontaktet.
- `ContactsTable.tsx` — `table-fixed` (Emri · Pozicioni · Telefon · Kontakti i fundit)
  në desktop, karta në mobile; rresht → karta e kontaktit. Eksporton `fullName`.
- `ContactSheet.tsx` — fletë `Sheet` shto/ndrysho kontakt; `sector_id` i fiksuar
  (krijim nga vendi) ose i zgjedhshëm (ndryshim profili).
- `ContactProfile.tsx` — emri i madh, pozicioni, tel/email si lidhje, vendi;
  "Lexo më shumë" (përshkrimi), "Ndrysho profilin", "Fshi kontaktin".
- `ContactNotes.tsx` — `listNotes` me `useGenLoad`; formë "＋ Shënim" (datë ≤ sot +
  textarea + hint) me përditësim optimist; `NoteRow` për edito/fshi.
- `NoteRow.tsx` — një shënim: data (mono) + teksti + edito inline / fshi.
- `Breadcrumb.tsx` — shteg Vendet › {vendi} › {emri}.
- `WorkplaceManager.tsx` — seksioni te Cilësimet: shto / riemërto inline / fshi
  (409 → mesazh, s'fshihet).

**Lidhet me:** `components/common/*`, `components/shell/ShellContext`, `lib/api`,
`lib/date`.
