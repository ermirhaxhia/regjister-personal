-- ============================================================================
-- Migrimi 005 — Aktivitet Fizik ripërkufizohet (Moduli 5)
--
-- Modeli i ri:
--   activity_types  — lloje aktiviteti me emër të lirë (Ecje, Vrapim, Palestër);
--                     secili zgjedh 1+ njësi nga një vokabular fiks:
--                       hapa, km, kohe, metra, perseritje, sete, pesha, kalori
--                     + synim ditor opsional (daily_goal / goal_unit).
--   fitness_entries — hyrje ditore; lidhet me një lloj; vlerat te `values` jsonb
--                     me çelësa = njësitë e llojit, p.sh. {"km": 5.2, "kohe": 32}.
--                     Disa hyrje për të njëjtën ditë lejohen (PA unique te entry_date).
--
-- KUJDES — HEQJE: `drop table fitness_log` FSHIN tabelën fitness_log dhe TË GJITHA
--   rreshtat në të (bashkë me trigger-in fitness_log_set_updated_at dhe indeksin
--   fitness_log_entry_date_idx). Të dhënat aktuale janë vetëm nga testet (hapa /
--   Ecje / Futboll të futura gjatë provave) — s'ka të dhëna reale për t'u migruar.
--   Modeli i vjetër zëvendësohet plotësisht.
--
-- `"values"` shkruhet gjithmonë me thonjëza — është fjalë e rezervuar në SQL.
--
-- Ekzekuto te Supabase SQL Editor (ose backend/run_migration.py përmes pooler-it).
-- ============================================================================

begin;

-- 1) activity_types — lloje aktiviteti të përcaktuara nga përdoruesi ----------
create table activity_types (
    id          uuid primary key default gen_random_uuid(),
    name        text not null unique,
    units       text[] not null,
    daily_goal  numeric(12,2),                 -- opsional; synim ditor
    goal_unit   text,                          -- opsional; njësia së cilës i takon synimi
    sort_order  int not null default 0,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),
    constraint activity_types_units_not_empty
        check (cardinality(units) >= 1),
    -- njësitë duhet të jenë nënbashkësi e vokabularit fiks
    constraint activity_types_units_valid
        check (units <@ array['hapa','km','kohe','metra','perseritje','sete','pesha','kalori']::text[]),
    -- nëse ka synim ditor, duhet edhe njësia e tij dhe duhet të jetë një nga `units`
    constraint activity_types_goal_unit_valid
        check (daily_goal is null or (goal_unit is not null and goal_unit = any(units)))
);

create trigger activity_types_set_updated_at
    before update on activity_types
    for each row execute function moddatetime(updated_at);

-- 2) fitness_entries — hyrje ditore sipas llojit ----------------------------
create table fitness_entries (
    id               uuid primary key default gen_random_uuid(),
    entry_date       date not null default current_date,
    -- restrict: s'fshihet dot një lloj që ka ende hyrje
    activity_type_id uuid not null references activity_types (id) on delete restrict,
    "values"         jsonb not null default '{}'::jsonb,  -- çelësat = njësitë e llojit
    note             text,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

create index fitness_entries_entry_date_idx       on fitness_entries (entry_date desc);
create index fitness_entries_activity_type_id_idx on fitness_entries (activity_type_id);

create trigger fitness_entries_set_updated_at
    before update on fitness_entries
    for each row execute function moddatetime(updated_at);

-- 3) HEQJE: modeli i vjetër fitness_log zëvendësohet plotësisht -------------
--    Fshin tabelën + të gjitha rreshtat + trigger-in + indeksin e saj.
drop table fitness_log;

commit;

-- PostgREST: rifresko cache-in e skemës.
notify pgrst, 'reload schema';
