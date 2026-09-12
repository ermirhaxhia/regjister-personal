# components/aktivitet/ — Komponentët e modulit Aktivitet Fizik

**Qëllimi:** Një kartë për çdo lloj aktiviteti, modali i hyrjes për një lloj të
fiksuar, dhe tabela e historisë së plotë të hyrjeve.

**Përmban:**
- `ActivityCard.tsx` — kartë e klikueshme për një `ActivityType` (grid 1→2→3).
  Emri + chips njësish; me `daily_goal` → `GoalBody`; pa synim → "Fundit: …" +
  "N hyrje këtë muaj". Klik / Enter / Space → hap `EntryModal` për atë lloj.
- `GoalBody.tsx` — trupi i synimit: `ProgressRing` `today_total/goal`, "N njësi deri
  te synimi" (ose "Synim i arritur"), chip streak, `GoalMiniChart` 30-ditor.
- `GoalMiniChart.tsx` — shtylla SVG nga `series`, vijë synimi vjollcë e ndërprerë.
- `ProgressRing.tsx` — unazë SVG `value / goal`.
- `EntryModal.tsx` — `Sheet` me lloj të fiksuar (pa dropdown): një fushë numër për
  çdo njësi te `activity_type.units` (etiketa nga `listUnits`, `step` sipas
  `decimal`, `inputMode` decimal/numeric), datë (default sot, statike kur editon),
  `note`. Submit çaktivizohet pa ≥1 vlerë > 0. → `createFitnessEntry` /
  `updateFitnessEntry`.
- `EntriesTable.tsx` — `table-fixed` (Data · Lloji · Vlerat · Shënim · veprime) +
  karta të stivosura në mobile. "Vlerat" = `describeValues`.

**Lidhet me:** `components/common/*`, `lib/api`, `lib/date`, `lib/fitnessUnits`.
