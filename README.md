# Regjistri Personal

Aplikacion personal (jo publik) i llojit "ditar i strukturuar" — mban shënime ditore
mbi shpenzime, të ardhura, gjumë, zakone, aktivitet fizik dhe kolegë/kontakte pune,
dhe nxjerr prej tyre pamje të konsoliduara: ballinë me balancë e ritëm shpenzimi,
parashikim afatshkurtër, flamuj "Vëmendje", "Zbulime" me korrelacione mes moduleve,
dhe "Dita" si pamje e gjithçkaje për një datë.

## Modulet

- **Shpenzime** — regjistrim + kategori të menaxhuara nga Cilësimet
- **Të ardhura** — paga (ndarje 50/50 personale/familje) ose tjetër, burime të menaxhuara
- **Gjumi** — netët, synimi ditor i orëve
- **Zakone** — binare (po/jo) ose me kohëzgjatje
- **Aktivitet Fizik** — lloje aktiviteti me njësi matëse fleksibël (km, kohë, hapa…)
- **Burime Njerëzore** — vende pune, kolegë, shënime ndërveprimi (CRM i vogël)
- **Dita** — gjithçka e regjistruar për një datë, nga të 6 modulet, në një ekran
- **Zbulime** — korrelacione automatike mes moduleve (gjumë↔shpenzim, ditë jave, stërvitje↔zakone…)
- **Cilësime** — menaxhimi i listave/synimeve të çdo moduli + ndryshimi i PIN-it

## Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Backend:** FastAPI (Python)
- **Databaza:** Supabase (Postgres)
- **Auth:** PIN 4–8 shifra (bcrypt + pepper) + token sesioni (JWT, 7 ditë)

## Struktura

- `frontend/` — Next.js, akses vetëm me PIN
- `backend/` — FastAPI, një file rrugësh/modelesh për modul
- `db/migrations/` — migrimet SQL; `schema.sql` në rrënjë mban skemën e plotë aktuale
- `design/` — mockup-e HTML të dizajnit
- `CHANGELOG.md` — çdo ndryshim, sipas datës, më i riu në krye

## Nisja lokale

Backend:
```
cd backend
python -m venv .venv && .venv/Scripts/pip install -r requirements.txt
cp .env.example .env   # plotëso me çelësat e Supabase
.venv/Scripts/python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Frontend:
```
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npm run dev
```

Detaje shtesë te `backend/README.md` dhe `frontend/README.md`; kërkesat e plota
te `KERKESAT-PROJEKTI-1.md` dhe konventat e punës te `Rregullat projektit.md`.
