# components/koleksion/ — Komponentët e modulit Koleksion

**Qëllimi:** Kartat dhe format për koleksione progresi (të lidhura me zakone të
tipit `koleksion`), të përdorura te `app/panel/zakone/koleksion/`.

**Përmban:**
- `CollectionCard.tsx` — kartë koleksioni: emër, sasi totale + progres (nëse
  `total_amount` s'është `null`), ritmi/parashikimi (nëse `amount_per_day` s'është
  `null`). Njësia (`faqe`, `ushtrime`, etj.) vjen si prop nga `habit.unit_label`.
- `CollectionForm.tsx` — fletë `Sheet` "Koleksion i ri": emër, total opsional.
  Konsumon `POST /habits/{habitId}/collections`.
- `CollectionEditSheet.tsx` — fletë redaktimi: emër, total, status
  (aktiv/pauzë/përfunduar). Konsumon `PATCH /collections/{id}`.
- `EntrySheet.tsx` — fletë `Sheet` "Hyrje e re": datë, sasi, minuta opsionale,
  shënim opsional. Konsumon `POST /collections/{id}/entries`.
- `EntryList.tsx` — listë hyrjesh (më e fundit sipër): datë, sasi + njësi, minuta,
  shënim, buton fshirjeje.

**Lidhet me:** `components/common/*`, `lib/api`, `lib/date`.
