# Rregullat e Projektit — Regjistri Personal

Ky dokument përcakton rregullat strikte për strukturën e file/folder-ave, komentet në kod, dokumentimin, dhe changelog-un. Qëllimi: çdo pjesë e projektit të jetë e gjetshme shpejt, pa lexim të panevojshëm të gjithë projektit.

---

## 1. Struktura e folderave

Rregull bazë: **një file për modul**, jo file gjigant me gjithçka.

```
/backend
  /routes
    expenses.py
    income.py
    sleep.py
    habits.py
    fitness.py
    colleagues.py
    auth.py
  /models
    expenses.py
    ...
  README.md

/frontend
  /app
    /expenses
    /income
    /sleep
    ...
  /components
  README.md

/docs
  changelog-archive-2026-Q1.md
  changelog-archive-2026-Q2.md

CHANGELOG.md          ← vetëm rrënja, 1 i vetëm aktiv
README.md             ← përmbledhje e projektit, rrënja
```

**Rregull strikte:** Asnjë file s'duhet të kalojë ~300 rreshta kod. Nëse e kalon, ndahet në module më të vogla.

---

## 2. Komentet në kod

- **Shtohen VETËM pasi një modul është stabël** (jo gjatë zhvillimit aktiv)
- Vetëm **docstring/header i shkurtër** në krye të çdo funksioni kryesor — çfarë bën, jo si e bën rresht-për-rresht
- Komente brenda funksionit **vetëm** kur logjika s'është e vetëkuptueshme (p.sh. formula matematikore, workaround i çuditshëm)
- Gjuha: shqip, direkt, pa fjali të gjata

```python
def calculate_monthly_average(user_id: str, month: str):
    """Llogarit mesataren e shpenzimeve mujore, duke përjashtuar ditët pa hyrje."""
    ...
```

---

## 3. README.md — një për çdo folder kryesor

**Template strikt (mbahet i shkurtër, max ~15 rreshta):**

```markdown
# [Emri i folderit]

**Qëllimi:** Një fjali — çfarë bën ky folder.

**Përmban:**
- file1.py — çfarë bën (1 rresht)
- file2.py — çfarë bën (1 rresht)

**Lidhet me:** tabelat/modulet e tjera që prek (p.sh. "expenses table te Supabase")
```

Asnjë prozë e gjatë. Nëse dikush (ti ose unë) hap README-në, duhet të kuptojë folderin brenda 10 sekondave.

---

## 4. CHANGELOG.md — formati strikt për filtrim të shpejtë

**Struktura e çdo hyrjeje (gjithmonë e njëjta, për grep/filtrim):**

```
## YYYY-MM-DD
[MODUL: emri] [LLOJI: SHTIM|NDRYSHIM|HEQJE|FIX] emri_funksionit_ose_pjese (path/file) — pershkrim shkurt — arsyeja (nese ka)
```

**Shembuj konkretë:**

```
## 2026-09-15
[MODUL: expenses] [LLOJI: HEQJE] calculate_weekly_average (routes/expenses.py) — formulë e gabuar, s'përjashtonte ditë bosh — zëvendësuar me calculate_monthly_average
[MODUL: auth] [LLOJI: SHTIM] pin_verify_endpoint (routes/auth.py) — verifikim PIN + pepper + bcrypt
[MODUL: sleep] [LLOJI: FIX] night_date logic (routes/sleep.py) — nuk trajtonte rastin kur bie në gjumë pas mesnate
```

**Pse ky format më lehtëson leximin:**
- Tag-et `[MODUL: X]` dhe `[LLOJI: Y]` më lejojnë të kërkoj/filtroj shpejt pa lexuar gjithë file-in (p.sh. "trego vetëm ndryshimet e modulit expenses")
- Rreshti i vetëm (jo paragraf) do të thotë skanoj shpejt shumë hyrje njëherësh
- Data në krye më lejon të lexoj vetëm intervalin që më duhet, jo gjithë historikun

**Rregulla shtesë:**
- **1 hyrje = 1 rresht.** Jo fjali të gjata shpjeguese
- Hyrjet renditen kronologjikisht, më e reja lart
- `CHANGELOG.md` mban **vetëm ~30-60 ditët e fundit**

---

## 5. Arkivimi (rregull periodik)

Kur `CHANGELOG.md` kalon ~300-500 rreshta (~1-2 muaj histori):

1. Hyrjet më të vjetra se 30 ditë zhvendosen te `/docs/changelog-archive-YYYY-QN.md`
2. `CHANGELOG.md` mbetet me vetëm muajin aktiv
3. Kjo bëhet **manualisht kur kërkohet**, jo automatikisht — i thua Claude Code: *"arkivo hyrjet para datës X"*

**Kur më duhet histori e vjetër:** nëse pyetja jote është qartazi historike (p.sh. "çfarë ndryshoi te sleep 3 muaj më parë"), hap arkivin përkatës direkt — s'e lexoj çdo herë "për çdo rast".

---

## 6. Rregull i përgjithshëm për çdo kërkesë te Claude Code

Kur i kërkon ndryshim, shto në fund të kërkesës:

> *"Shto hyrje te CHANGELOG.md sipas formatit [MODUL][LLOJI]. Shto/përditëso README.md të folderit nëse struktura ndryshoi. Mos shto komente kodi tani — vetëm kur moduli të jetë stabël."*

Kështu këto rregulla zbatohen automatikisht, pa pasur nevojë t'i kujtosh çdo herë.