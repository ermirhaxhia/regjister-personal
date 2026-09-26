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
- `ActivityTypeManager.tsx` — listë llojesh aktiviteti (emër + chips njësish +
  "synim: N njësi") me shto / modifiko / fshi (409 → mesazh). Konsumon
  `GET/POST/PATCH/DELETE /activity-types` + `GET /activity-types/units`.
- `ActivityTypeForm.tsx` — formë e përbashkët shto/edito: emër + `UnitPicker` +
  `daily_goal` opsional + dropdown `goal_unit` nga njësitë e zgjedhura.
- `UnitPicker.tsx` — chips toggle për zgjedhje të shumëfishtë njësish.
- `HabitManager.tsx` — menaxhon zakonet (prop `bare` për brenda Sheet): listë aktive
  me riemërto (`components/zakone/HabitSheet`) / arkivo, formë "Shto zakon" (emër +
  dropdown `tracking_type`: binar / kohëzgjatje / koleksion, me fushë shtesë
  `unit_label` kur zgjidhet koleksion), seksion i palosur "Arkivuar"
  (`components/zakone/ArchivedHabits`) me ri-aktivizim / fshirje (`Confirm`). 409 →
  mesazh. Konsumon `GET/POST/PATCH/DELETE /habits`.
- `ExpenseCategoryManager.tsx` — menaxhon kategoritë e shpenzimeve (prop `bare`):
  formë "Shto" (vetëm emër), listë sipas `sort_order` me numër shpenzimesh,
  riemërtim inline (Enter/blur/Esc) dhe fshirje me `Confirm` (mesazhi varet nga
  `expense_count`). 409 → mesazh. Konsumon `GET/POST/PATCH/DELETE /expense-categories`.
- `IncomeSourceManager.tsx` — mirror i `ExpenseCategoryManager` për burimet e të
  ardhurave (prop `bare`). Konsumon `GET/POST/PATCH/DELETE /income-sources`.
- `SleepGoalForm.tsx` — formë e vogël, sinjal "orë gjumi" (1–16, hap 0.5), ruan si
  minuta. Konsumon `GET/PUT /settings/sleep-goal`.
- `SchoolScheduleManager.tsx` — menaxhon orarin fiks javor: listë seancash grupuar
  sipas ditës së javës (0=Hënë..6=Diel), të renditura kronologjikisht brenda ditës,
  me shto / modifiko (inline `SchoolSessionForm`) / fshi (`Confirm`). Konsumon
  `GET/POST/PATCH/DELETE /school/sessions`.
- `SchoolSessionForm.tsx` — formë e përbashkët shto/edito për një seancë: lëndë,
  lloj (input me `datalist` sugjerimesh), profesor/sallë opsionale, select ditë
  jave, dy `input type="time"`, toggle `is_active`.

**Lidhet me:** `components/common/*`, `components/hr/WorkplaceManager` (te Sheet),
`components/zakone/HabitSheet` + `ArchivedHabits` (te HabitManager), `lib/api`,
`lib/fitnessUnits`, `lib/useGenLoad`, `lib/weekday`.
