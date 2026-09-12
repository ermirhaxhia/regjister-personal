# backend

**Qëllimi:** API-ja (FastAPI) që lidh frontend-in me databazën Supabase.

**Përmban:**
- main.py — pika hyrëse, CORS, regjistron routes, /health
- set_pin.py — script një-përdorimësh për të vendosur/ndryshuar PIN-in te app_auth
- core/config.py — variablat nga .env
- core/database.py — klienti i Supabase (service_role)
- core/security.py — PIN + pepper + sha256 + bcrypt; varësia require_auth (header X-PIN)
- routes/ — një file për modul: auth, expenses, income, sleep
- models/ — modele Pydantic, një file për modul

**Lidhet me:** tabelat te Supabase (schema.sql në rrënjë) — app_auth, expenses, income, income_allocations, sleep_log
