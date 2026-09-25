# components/dita/ — Pamja ditore e edituar

**Qëllimi:** Faqja `/panel/dita` — jo më vetëm lexim: një ekran i vetëm ku shtohen,
ndryshohen dhe fshihen të dhënat e ditës për 6 modulet + check-in-in e humorit/energjisë,
duke thirrur direkt API-të ekzistuese të secilit modul (asnjë koncept i ri "dita e
konfirmuar" në DB).

**Përmban:**
- `DayNav.tsx` — navigimi i datës (shigjeta, `<input type="date">`, buton «Sot»).
- `DaySection.tsx` — mbështjellës karte: ikonë + titull + numërues + `action`
  (buton "+" opsional në header) + `children` + `footer` opsional.
- `DayHeaderAction.tsx` — butoni i vogël "+" për header-in e një `DaySection`.
- `DayBoard.tsx` — merr listat e referencës (kategori, burime, lloje aktiviteti,
  njësi, kontakte) dhe kompozon 6 seksionet editueshme.
- `Day*Section.tsx` (Expenses, Income, Sleep, Habits, Fitness, Notes) — secili
  menaxhon shto/ndrysho/fshi për modulin e vet, duke ripërdorur `Sheet`-et/modalet
  ekzistuese (`ExpenseSheet`, `IncomeSheet`, `SleepSheet`, `EntryModal`) dhe
  `TodayControl` nga `components/zakone`; pas çdo mutacioni thërret `onChanged`
  (=`refresh()` nga `useGenLoad` te faqja).
- `DayMoodSection.tsx` — check-in i humorit/energjisë (1-5) + shënim opsional; `/day/{d}`
  nuk e përfshin moodin, ndaj ky komponent ngarkon/ruan vetë me `getMood`/`upsertMood`/
  `deleteMood`, pa u varur nga `onChanged` i `DayBoard`.

**Kufizim i njohur:** `DayNote` nga `/day/{d}` s'ka `colleague_id`, ndaj shënimet
ekzistuese të një dite shfaqen vetëm për lexim (edit/delete kërkon shtim të asaj
fushe në backend — shih raportin).

**Lidhet me:** `lib/api`, `lib/date`, `lib/money`, `lib/fitnessUnits`, `lib/cn`,
`components/common/*`, `components/zakone/TodayControl`,
`components/shpenzime/ExpenseSheet`, `components/te-ardhura/IncomeSheet`,
`components/gjumi/SleepSheet`, `components/aktivitet/EntryModal`, `components/icons`.
