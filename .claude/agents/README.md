# .claude/agents

**Qëllimi:** Subagjentë të specializuar për Claude Code në këtë projekt.

**Përmban:**
- frontend-agent.md — specialist Next.js: faqe, komponente, stilim dark/bento; nuk prek backend/DB
- backend-agent.md — specialist FastAPI: routes, modele Pydantic, logjike biznesi, Supabase; nuk prek DB schema/frontend
- db-agent.md — specialist Supabase/Postgres: skema, tabela, migrime; nuk shkruan kod backend/frontend

**Lidhet me:** frontend/app/, design/, backend/routes/, backend/models/, schema.sql, CHANGELOG.md
