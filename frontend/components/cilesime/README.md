# components/cilesime/ — Komponentët e faqes Cilësime

**Qëllimi:** Kartat e moduleve dhe menaxherët që hapen nga faqja e Cilësimeve.

**Përmban:**
- `ModuleCard.tsx` — kartë drejtkëndore për një modul: ikonë + emër (Space Grotesk)
  + një rresht përshkrim + chip statusi (`aktiv` jeshile / `së shpejti` gri) +
  buton "Modifiko" (lapsi). Aktive = solide; të tjerat = të zbehta.
- `PinChangeCard.tsx` — kartë "Ndrysho PIN-in": 3 fusha (aktual/i ri/konfirmo,
  validim `^\d{4,8}$` + përputhje lokale) + buton "Ruaj" me gjendje `busy`; në
  sukses përditëson edhe PIN-in e ruajtur lokalisht (`storePin`). Konsumon
  `POST /auth/pin`.
- `OpeningBalanceCard.tsx` — kartë "Bilanci fillestar": kur `locked: false`
  shfaq fushë numerike + paralajmërim se vendoset **vetëm një herë**; pas
  ruajtjes kalon vetë (nga përgjigja e API-t) në gjendje `locked: true` ku
  shfaqet vetëm shuma e formatuar, pa mundësi ndryshimi. `409` → "Është
  vendosur tashmë." Konsumon `GET/POST /settings/opening-balance` (s'ka
  PUT/PATCH — me qëllim).
- `ActivityTypeManager.tsx` — listë llojesh aktiviteti (emër + chips njësish +
  "synim: N njësi") me shto / modifiko / fshi (409 → mesazh). Konsumon
  `GET/POST/PATCH/DELETE /activity-types` + `GET /activity-types/units`.
- `ActivityTypeForm.tsx` — formë e përbashkët shto/edito: emër + `UnitPicker` +
  `daily_goal` opsional + dropdown `goal_unit` nga njësitë e zgjedhura.
- `UnitPicker.tsx` — chips toggle për zgjedhje të shumëfishtë njësish.
- `HabitManager.tsx` — menaxhon zakonet (prop `bare` për brenda Sheet): listë aktive
  me riemërto (`components/zakone/HabitSheet`) / arkivo, formë "Shto zakon" (emër +
  dropdown `tracking_type`), seksion i palosur "Arkivuar" (`components/zakone/
  ArchivedHabits`) me ri-aktivizim / fshirje (`Confirm`). 409 → mesazh. Konsumon
  `GET/POST/PATCH/DELETE /habits`.
- `ExpenseCategoryManager.tsx` — menaxhon kategoritë e shpenzimeve (prop `bare`):
  formë "Shto" (vetëm emër), listë sipas `sort_order` me numër shpenzimesh,
  riemërtim inline (Enter/blur/Esc) dhe fshirje me `Confirm` (mesazhi varet nga
  `expense_count`). 409 → mesazh. Konsumon `GET/POST/PATCH/DELETE /expense-categories`.
- `IncomeSourceManager.tsx` — mirror i `ExpenseCategoryManager` për burimet e të
  ardhurave (prop `bare`). Konsumon `GET/POST/PATCH/DELETE /income-sources`.
- `SleepGoalForm.tsx` — formë e vogël, sinjal "orë gjumi" (1–16, hap 0.5), ruan si
  minuta. Konsumon `GET/PUT /settings/sleep-goal`.

**Lidhet me:** `components/common/*`, `components/hr/WorkplaceManager` (te Sheet),
`components/zakone/HabitSheet` + `ArchivedHabits` (te HabitManager), `lib/api`,
`lib/fitnessUnits`, `lib/useGenLoad`.
