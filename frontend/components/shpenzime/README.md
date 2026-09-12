# components/shpenzime/ — Komponentët e modulit Shpenzime

**Qëllimi:** Listimi dhe forma e shpenzimeve.

**Përmban:**
- `ExpenseList.tsx` — tabelë/listë responsive: datë · kategori · përshkrim · shumë + edito/fshi.
- `ExpenseSheet.tsx` — formë shto/edito në `Sheet` (shumë>0, datë, përshkrim). Kategoria
  është `<select>` nga lista e menaxhuar (`categories` prop) + opsioni "＋ Kategori e re"
  që krijon kategorinë me `createExpenseCategory` para ruajtjes (409 → përdor emrin).
- `MonthFilter.tsx` — filtër `<input type="month">` + `monthRange()` (date_from/date_to).

**Lidhet me:** `components/common/*`, `components/shell/ShellContext`, `lib/api`, `lib/money`, `lib/date`.
