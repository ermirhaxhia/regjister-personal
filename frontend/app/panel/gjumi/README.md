# app/panel/gjumi/ — Gjumi

**Qëllimi:** Regjistri i netëve: fillim/fund si timestamp të plotë, kohëzgjatje nga DB.

**Përmban:**
- `page.tsx` — listë sipas `night_date` zbritës, ora lokale për fillim→fund,
  kohëzgjatja si `Xh Ym`, trajton kalimin e mesnatës. Shto/edito/fshi me konfirmim.
  Validim `fund > fillim`. Tri gjendjet. Sipër listës, `SleepGoalStrip` krahason
  mesataren e fundit me synimin e ruajtur.

**Endpoint-e:** `GET/POST /sleep`, `PATCH/DELETE /sleep/{id}`, `GET /settings/sleep-goal`.

**Lidhet me:** `components/gjumi/*`, `components/common/*`, `lib/api`, `lib/date`.
