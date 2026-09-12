# Regjistri Personal — Dokumenti i Kërkesave

## Përmbledhje
Aplikacion web personal (jo publik) për të mbajtur shënime ditore mbi shpenzime, të ardhura, gjumë, zakone, aktivitet fizik dhe kontakte pune — si një "ditar i strukturuar" për të kuptuar veten më mirë.

---

## Stack Teknik
- **Databaza:** Supabase (Postgres, plan falas)
- **Backend:** FastAPI (Python)
- **Frontend:** Next.js
- **Hosting:** Vercel (frontend), Supabase (backend/DB)
- **Kod:** GitHub (për vazhdimësi edhe pa Claude Code)

---

## Auth (Hyrja)
- PIN 4-shifror i thjeshtë për UI
- Backend: PIN + "pepper" personal (string sekret, ruhet te `.env`, jo te DB) + **bcrypt** për hash — jo algoritëm i shpikur vetë
- Qëllimi: aksesi vetëm për vetë përdoruesin, s'duhet të jetë "e lehtë të hyjë gjithkush"

---

## 6 Modulet

### 1. Shpenzime (Expenses)
- Hyrje ditore: shumë, kategori, datë, përshkrim

### 2. Të ardhura (Income)
- Paga hyn si `income` (jo ditore — një herë në muaj)
- Ndarje automatike 50/50: `income_allocations` → "familje" / "personale"
- Shpenzimet ditore krahasohen me pjesën "personale" për të parë sa mbetet deri në pagën tjetër

### 3. Gjumi (Sleep)
- `sleep_start` dhe `sleep_end` si **timestamp të plotë** (jo vetëm datë) — trajton rastin kur bie në gjumë një ditë dhe zgjohet ditën tjetër
- `night_date` = data kur bie në gjumë (jo kur zgjohet)
- Kohëzgjatja llogaritet automatikisht nga databaza (EXTRACT EPOCH)

### 4. Zakone (Habits)
- Përfshin: shkollë (orë në mësim), lexim jashtëshkollor, mësim/detyra në shtëpi
- Format binar (po/jo) ose kohëzgjatje (minuta), varësisht zakonit

### 5. Aktivitet Fizik (Fitness)
- Bazë: numri i hapave/ditë (fusha e vetme e detyrueshme fillimisht)
- `activity_type` + `duration_minutes` mbeten bosh derisa fillon palestër — pastaj plotësohen
- Struktura lejon shtim orari palestre më vonë pa ndryshuar skemën

### 6. Kolegët (Colleagues / Contact Log)
**Konteksti:** Punon në sektor shitjesh, ka kontakt jo të drejtpërdrejtë me ~40-50 staf shitjesh (role të ndryshme: asistent, operator, përgjegjës sektori, menaxher) + 5 kolegë të drejtpërdrejtë në zyrë. I duhet të mbajë mend njerëz për të marrë info produktesh të reja, pa qenë i "ftohtë" si person.

**Skema (e thjeshtuar në log ditor):**
```
sectors     → id, name (p.sh. "Shitje Elektronikë")
colleagues  → id, name, role, sector_id (FK)
contact_log → id, colleague_id (FK), date, note (fushë e lirë)
```
Shembull: `colleague_id: 12, date: 2026-08-20, note: "Takova, mora 2 produkte"`

**Kujdes privatësie:** Vetëm info profesionale/faktike (role, sektor, çfarë u diskutua) — jo gjykime personale apo vëzhgime private mbi njerëzit.

---

## Fleksibilitet Shtesë
- Buton "Shto seksion" për module të reja të krijuara nga vetë përdoruesi (p.sh. "Familja", "Shkolla" si folder të lirë)
- Kërkon skemë fleksibël (JSONB te Supabase) — **planifikohet veçmas** para se të bëhet funksional, jo hap i parë

---

## Dizajni
**Referenca konkrete:** Dashboard "Fluxo" (Behance) — fintech app dark-mode:
- Sfond gati-i zi (#0A0A0C), karta të errëta me kontur delikat
- Aksent portokalli (#FF7A3C) + vjollcë (#7C7FE0) si theksim, jo mbi-përdorim
- **Bento grid + Minimalism** si stil UI (jo skeuomorphism/glassmorphism/neumorphism)
- Sidebar me ikona (desktop), tab-bar poshtë (mobile)
- **Ikona: vetëm SVG line-icons, KURRË emoji** — duket "fillestare"/joserioze
- Grafik shtyllash (cash flow javor), donut chart (shpenzime sipas kategorisë), progress bars (zakone/synime)
- Kompakt, preciz, "serioz" — jo lozonjar apo dekorativ

---

## Dokumentimi & Struktura e Kodit
- **Një file për modul** (jo file gjigant), max ~300 rreshta/file
- **README.md** në çdo folder kryesor — qëllimi, çfarë përmban, me çfarë lidhet (max ~15 rreshta)
- **CHANGELOG.md** i vetëm në rrënjë — format strikt:
  ```
  [MODUL: emri] [LLOJI: SHTIM|NDRYSHIM|HEQJE|FIX] emri_funksionit (path) — përshkrim — arsyeja
  ```
- Për heqje kodi: gjithmonë shënohet çfarë u hoq, pse, dhe me çfarë u zëvendësua
- Komentet në kod shtohen **vetëm pas** stabilizimit të modulit, jo gjatë zhvillimit aktiv
- CHANGELOG arkivohet periodikisht (~30-60 ditë aktive, pjesa tjetër te `/docs/changelog-archive-*.md`)

---

## Plan Pune (me Claude Code, Pro 1-mujor)
Të ndara në sesione të vogla, jo gjithçka njëherësh:
1. Skema SQL e plotë (6 module + auth) — miratohet para se të vazhdohet
2. Auth/PIN screen — testohet veçmas
3. Modul pas moduli (fillo me Shpenzime), secili i testuar para se të vazhdojë tjetri
4. Kod te GitHub gjatë gjithë kohës, për vazhdimësi pas mbylljes së Pro