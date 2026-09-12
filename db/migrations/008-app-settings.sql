-- ============================================================================
-- Migrimi 008 — Cilësime globale (app_settings)
--
-- Tabelë e përgjithshme çelës/vlerë për cilësime të vogla të gjithë aplikacionit
-- (jo të lidhura me një modul të vetëm). Fillon me synimin ditor të gjumit;
-- ripërdorshme më vonë p.sh. për përqindjen e ndarjes së pagës.
--
-- `value` është `jsonb` që të mbajë çdo tip vlere (numër, tekst, objekt) pa
-- ndryshuar strukturën e tabelës për çdo cilësim të ri.
--
-- Ekzekuto te Supabase SQL Editor (ose backend/run_migration.py përmes pooler-it).
-- ============================================================================

begin;

create table app_settings (
    key        text primary key,
    value      jsonb not null,
    updated_at timestamptz not null default now()
);

create trigger app_settings_set_updated_at
    before update on app_settings
    for each row execute function moddatetime(updated_at);

-- Vlerë fillestare: synimi ditor i gjumit = 480 minuta (8 orë).
insert into app_settings (key, value) values
    ('sleep_goal_minutes', '480'::jsonb);

commit;

-- PostgREST: rifresko cache-in e skemës.
notify pgrst, 'reload schema';
