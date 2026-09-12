# components/gjumi/ — Komponentët e modulit Gjumi

**Qëllimi:** Listimi i netëve dhe forma e gjumit.

**Përmban:**
- `SleepList.tsx` — rreshta me `night_date`, fillim→fund në orë lokale, kohëzgjatje `Xh Ym`,
  shënon datat kur nata kalon mesnatën.
- `SleepSheet.tsx` — formë shto/edito në `Sheet` me `datetime-local`; validim `fund > fillim`;
  `night_date` lihet bosh (backend e nxjerr).
- `SleepGoalStrip.tsx` — shirit i vogël sipër listës: mesatarja e deri 7 netëve të
  fundit (nga `items` që faqja ka tashmë) kundrejt `GET /settings/sleep-goal`; bosh
  kur s'ka hyrje.

**Lidhet me:** `components/common/*`, `components/cilesime/SleepGoalForm`,
`components/shell/ShellContext`, `lib/api`, `lib/date`.
