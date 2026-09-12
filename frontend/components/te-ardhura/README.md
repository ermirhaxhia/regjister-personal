# components/te-ardhura/ — Komponentët e modulit Të ardhura

**Qëllimi:** Listimi i pagave dhe forma e tyre.

**Përmban:**
- `IncomeList.tsx` — karta pagash me dy shirita alokimi (personale/familje) nga `allocations[]`.
- `IncomeSheet.tsx` — formë shto/edito në `Sheet` (shumë>0, muaji → dita 1, data e
  marrjes, burimi opsional si `<select>` nga `listIncomeSources()` + "＋ Burim i ri").

**Lidhet me:** `components/common/*`, `components/cilesime/IncomeSourceManager`,
`components/shell/ShellContext`, `lib/api`, `lib/money`, `lib/date`.
