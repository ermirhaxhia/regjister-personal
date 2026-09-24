# components/lexim/ — Komponentët e modulit Lexim

**Qëllimi:** Kartat e librave dhe format për librat/sesionet e leximit, të
përdorura te `app/panel/zakone/lexim/`.

**Përmban:**
- `BookCard.tsx` — kartë libri e klikueshme: titull, autor, shirit progresi
  (`pct_complete`), "{pages_read} / {total_pages} faqe", dhe nëse `pages_per_day`
  s'është `null`: ritmi + data e parashikuar e mbarimit.
- `BookForm.tsx` — fletë `Sheet` "Libër i ri": titull, autor (opsional), faqe
  gjithsej. Konsumon `POST /books`.
- `SessionSheet.tsx` — fletë `Sheet` "Sesion i ri": datë (parazgjedhje = data e
  fundit e përdorur), faqe të lexuara, minuta (opsionale), shënim (opsional).
  Konsumon `POST /books/{id}/sessions`.
- `SessionList.tsx` — listë sesionesh (më i fundit sipër): datë, faqe, minuta,
  shënim, buton fshirjeje.

**Lidhet me:** `components/common/*`, `lib/api`, `lib/date`.
