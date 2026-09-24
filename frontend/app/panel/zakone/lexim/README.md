# app/panel/zakone/lexim/ — Faqja Lexim

**Qëllimi:** Menaxhimi i librave dhe sesioneve të leximit; arrihet duke klikuar
zakonin me `tracking_type="lexim"` te tabela e Zakoneve (jo nga sidebar).

**Përmban:**
- `page.tsx` — lista e librave, ndarë "Duke lexuar" / "Të mbaruara"; buton
  "Libër i ri" (fletë `BookForm`). Konsumon `GET /books`.
- `[bookId]/page.tsx` — detaji i librit: progres, statistika (sesione, ritmi,
  parashikimi), listë sesionesh, shto sesion (`SessionSheet`), "Shëno si të
  mbaruar" (`PATCH /books/{id}`), "Fshi librin" (`DELETE /books/{id}`).
  Konsumon `GET /books/{id}`, `GET/POST/DELETE /books/{id}/sessions`.

**Lidhet me:** `components/lexim/*`, `components/common/*`, `lib/api`, `lib/date`.
