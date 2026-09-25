-- ============================================================================
-- MIGRIMI 014 — MODULI "ORË PUNE" (work_sessions)
-- Regjistrim manual i seancave të punës: fillimi, mbarimi, vendi i punës, shënim.
-- Përdoret për orë në javë, orë jashtë orarit, lidhje me gjumin dhe shpenzimet.
-- Modeluar sipas sleep_log: kohëzgjatja llogaritet automatikisht nga DB.
-- "Vendi i punës" lidhet me tabelën ekzistuese `sectors` (jo tabelë e re
-- "workplaces" — ai emër përdoret vetëm si alias te backend-i).
-- ============================================================================
begin;

create table work_sessions (
    id               uuid primary key default gen_random_uuid(),
    start_ts         timestamptz not null,
    end_ts           timestamptz not null,
    work_date        date        not null,   -- dita e punës (zakonisht data e start_ts)
    workplace_id     uuid references sectors (id) on delete set null,
    duration_minutes numeric(7,2) generated always as
                     (extract(epoch from (end_ts - start_ts)) / 60.0) stored,
    note             text,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now(),
    constraint work_sessions_end_after_start check (end_ts > start_ts)
);

create index work_sessions_work_date_idx on work_sessions (work_date desc);

create trigger work_sessions_set_updated_at
    before update on work_sessions
    for each row execute function moddatetime(updated_at);

commit;
notify pgrst, 'reload schema';
