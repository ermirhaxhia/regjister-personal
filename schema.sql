-- ============================================================================
-- Regjistri Personal — Skema SQL e plotë (Supabase / Postgres)
-- 6 module + auth. Aplikacion me një përdorues të vetëm.
-- Ekzekuto në Supabase SQL Editor. Miratohet para se të vazhdohet me kodin.
-- ============================================================================

-- Extensions -----------------------------------------------------------------
create extension if not exists pgcrypto;      -- gen_random_uuid()
create extension if not exists moddatetime;   -- trigger për updated_at

-- Funksion ndihmës: nuk na duhet i veçantë, moddatetime e mbulon updated_at.
-- RLS: lihet e çaktivizuar. Backend-i (FastAPI) lidhet me service_role key
--      dhe auth-i bëhet në nivel aplikacioni (PIN + pepper + bcrypt).


-- ============================================================================
-- AUTH
-- ----------------------------------------------------------------------------
-- Një rresht i vetëm. Ruan vetëm hash-in bcrypt të PIN-it.
-- "pepper"-i personal NUK ruhet këtu — rri te .env i backend-it.
-- ============================================================================
create table app_auth (
    id           smallint primary key default 1,
    pin_hash     text        not null,           -- bcrypt(pepper + pin)
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now(),
    constraint app_auth_single_row check (id = 1)
);

create trigger app_auth_set_updated_at
    before update on app_auth
    for each row execute function moddatetime(updated_at);


-- ============================================================================
-- MODULI 1 — SHPENZIME (expenses)
-- Hyrje ditore: shumë, kategori, datë, përshkrim.
-- ============================================================================
create table expenses (
    id           uuid primary key default gen_random_uuid(),
    amount       numeric(12,2) not null check (amount >= 0),
    category     text          not null,
    entry_date   date          not null default current_date,
    description  text,
    created_at   timestamptz   not null default now(),
    updated_at   timestamptz   not null default now()
);

create index expenses_entry_date_idx on expenses (entry_date desc);
create index expenses_category_idx   on expenses (category);

create trigger expenses_set_updated_at
    before update on expenses
    for each row execute function moddatetime(updated_at);


-- Listë kategorish e menaxhuar nga Cilësimet (thjesht emra + renditje).
-- PA FK me expenses: `expenses.category` mban emrin si tekst; riemërtimi i një
-- kategorie përhapet te shpenzimet nga backend-i (bulk-update).
create table expense_categories (
    id          uuid primary key default gen_random_uuid(),
    name        text not null unique,
    sort_order  int  not null default 0,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create trigger expense_categories_set_updated_at
    before update on expense_categories
    for each row execute function moddatetime(updated_at);


-- ============================================================================
-- MODULI 2 — TË ARDHURA (income)
-- Paga hyn një herë në muaj. Ndahet 50/50 në "familje" / "personale".
-- Shpenzimet ditore krahasohen me pjesën "personale".
-- ============================================================================
create table income (
    id           uuid primary key default gen_random_uuid(),
    amount       numeric(12,2) not null check (amount >= 0),
    kind         text          not null default 'paga'
                 check (kind in ('paga', 'tjeter')),           -- 'paga' ndahet 50/50; 'tjeter' 100% personale
    received_on  date          not null default current_date,  -- data kur hyri paga
    period_month date          not null,                       -- muaji që mbulon (dita = 01)
    source       text,                                         -- p.sh. "Paga"
    note         text,
    created_at   timestamptz   not null default now(),
    updated_at   timestamptz   not null default now()
);

create index income_received_on_idx  on income (received_on desc);
create index income_period_month_idx on income (period_month desc);

create trigger income_set_updated_at
    before update on income
    for each row execute function moddatetime(updated_at);


create table income_allocations (
    id           uuid primary key default gen_random_uuid(),
    income_id    uuid not null references income (id) on delete cascade,
    bucket       text not null check (bucket in ('familje', 'personale')),
    amount       numeric(12,2) not null check (amount >= 0),
    percentage   numeric(5,2)  not null default 50.00 check (percentage >= 0 and percentage <= 100),
    created_at   timestamptz   not null default now(),
    unique (income_id, bucket)
);

create index income_allocations_income_id_idx on income_allocations (income_id);


-- Listë burimesh e menaxhuar nga Cilësimet (thjesht emra + renditje).
-- PA FK me income: `income.source` mban emrin si tekst; riemërtimi i një
-- burimi përhapet te të ardhurat nga backend-i (bulk-update).
create table income_sources (
    id          uuid primary key default gen_random_uuid(),
    name        text not null unique,
    sort_order  int  not null default 0,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create trigger income_sources_set_updated_at
    before update on income_sources
    for each row execute function moddatetime(updated_at);


-- ============================================================================
-- MODULI 3 — GJUMI (sleep_log)
-- sleep_start / sleep_end si timestamp të plotë (trajton kalimin e ditës).
-- night_date = data kur bie në gjumë (jo kur zgjohet).
-- Kohëzgjatja llogaritet automatikisht nga DB (EXTRACT EPOCH).
-- ============================================================================
create table sleep_log (
    id               uuid primary key default gen_random_uuid(),
    sleep_start      timestamptz not null,
    sleep_end        timestamptz not null,
    night_date       date        not null,
    duration_minutes numeric(7,2) generated always as
                     (extract(epoch from (sleep_end - sleep_start)) / 60.0) stored,
    note             text,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now(),
    constraint sleep_log_end_after_start check (sleep_end > sleep_start)
);

create index sleep_log_night_date_idx on sleep_log (night_date desc);

create trigger sleep_log_set_updated_at
    before update on sleep_log
    for each row execute function moddatetime(updated_at);


-- ============================================================================
-- MODULI 4 — ZAKONE (habits)
-- shkollë (orë në mësim), lexim jashtëshkollor, mësim/detyra në shtëpi, etj.
-- Format binar (po/jo), kohëzgjatje (minuta) ose lexim (hap faqen e dedikuar
-- "Lexim" me libra + sesione, jo UI-n e zakonshëm të zakoneve).
-- ============================================================================
create table habits (
    id            uuid primary key default gen_random_uuid(),
    name          text not null unique,
    tracking_type text not null check (tracking_type in ('binary', 'duration', 'koleksion')),
    unit_label    text,           -- kuptimplotë vetëm kur tracking_type = 'koleksion', p.sh. "faqe", "ushtrime"
    is_active     boolean not null default true,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create trigger habits_set_updated_at
    before update on habits
    for each row execute function moddatetime(updated_at);


create table habit_log (
    id               uuid primary key default gen_random_uuid(),
    habit_id         uuid not null references habits (id) on delete cascade,
    entry_date       date not null default current_date,
    done             boolean,        -- përdoret kur habit-i është 'binary'
    duration_minutes integer check (duration_minutes >= 0),  -- kur është 'duration'
    note             text,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now(),
    unique (habit_id, entry_date),
    constraint habit_log_has_value check (done is not null or duration_minutes is not null)
);

create index habit_log_entry_date_idx on habit_log (entry_date desc);
create index habit_log_habit_id_idx   on habit_log (habit_id);

create trigger habit_log_set_updated_at
    before update on habit_log
    for each row execute function moddatetime(updated_at);

-- Siguron përputhjen e rreshtit me llojin e ndjekjes së zakonit:
-- 'binary' kërkon 'done' jo-NULL, 'duration' kërkon 'duration_minutes' jo-NULL.
create or replace function habit_log_check_type()
returns trigger
language plpgsql
as $$
declare
    v_tracking_type text;
begin
    select tracking_type into v_tracking_type
    from habits
    where id = new.habit_id;

    if v_tracking_type = 'binary' and new.done is null then
        raise exception 'Zakoni binar kërkon vlerë te "done" (nuk mund të jetë NULL).';
    elsif v_tracking_type = 'duration' and new.duration_minutes is null then
        raise exception 'Zakoni me kohëzgjatje kërkon vlerë te "duration_minutes" (nuk mund të jetë NULL).';
    end if;

    return new;
end;
$$;

create trigger habit_log_check_type_trg
    before insert or update on habit_log
    for each row execute function habit_log_check_type();


-- ============================================================================
-- MODULI I KOLEKSIONEVE (collections / collection_entries)
-- Sistem i përgjithshëm progresi: total (opsional) + hyrje kumulative, jo
-- vetëm për lexim — mund të përdoret për libra, ushtrime, projekte, etj.
-- Aktivizohet kur një zakon ka tracking_type = 'koleksion' (unit_label thotë
-- çfarë njësie mat, p.sh. "faqe"); koleksioni dhe hyrjet e tij menaxhohen te
-- faqja e dedikuar, jo si rreshta te habit_log.
-- ============================================================================
create table collections (
    id           uuid primary key default gen_random_uuid(),
    habit_id     uuid not null references habits (id) on delete cascade,
    name         text not null,
    total_amount int  check (total_amount is null or total_amount > 0),  -- opsional: pa total të njohur ende
    status       text not null default 'active' check (status in ('active', 'paused', 'finished')),
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

create index collections_habit_id_idx on collections (habit_id);

create trigger collections_set_updated_at
    before update on collections
    for each row execute function moddatetime(updated_at);


create table collection_entries (
    id           uuid primary key default gen_random_uuid(),
    collection_id uuid not null references collections (id) on delete cascade,
    entry_date   date not null default current_date,
    amount       int  not null check (amount > 0),
    minutes      int  check (minutes >= 0),
    note         text,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

create index collection_entries_collection_id_idx on collection_entries (collection_id);
create index collection_entries_entry_date_idx    on collection_entries (entry_date desc);

create trigger collection_entries_set_updated_at
    before update on collection_entries
    for each row execute function moddatetime(updated_at);


-- ============================================================================
-- MODULI 5 — AKTIVITET FIZIK (activity_types / fitness_entries)
-- Përdoruesi krijon lloje aktiviteti me emër të lirë (Ecje, Vrapim, Palestër);
-- për secilin zgjedh 1+ njësi nga vokabulari fiks:
--   hapa, km, kohe, metra, perseritje, sete, pesha, kalori
-- Çdo hyrje ditore lidhet me një lloj; vlerat rrinë te `values` jsonb ku çelësat
-- janë njësitë e llojit, p.sh. {"km": 5.2, "kohe": 32}. Disa hyrje/ditë lejohen.
-- `daily_goal` + `goal_unit` = synim ditor opsional për një njësi të llojit.
-- ============================================================================
create table activity_types (
    id          uuid primary key default gen_random_uuid(),
    name        text not null unique,
    units       text[] not null,
    daily_goal  numeric(12,2),                 -- opsional; synim ditor
    goal_unit   text,                          -- opsional; njësia e synimit
    sort_order  int not null default 0,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),
    constraint activity_types_units_not_empty
        check (array_length(units, 1) >= 1),
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


create table fitness_entries (
    id               uuid primary key default gen_random_uuid(),
    entry_date       date not null default current_date,
    activity_type_id uuid not null references activity_types (id) on delete restrict,
    "values"         jsonb not null default '{}'::jsonb,  -- çelësat = njësitë e llojit; citohet se është fjalë e rezervuar
    note             text,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

create index fitness_entries_entry_date_idx       on fitness_entries (entry_date desc);
create index fitness_entries_activity_type_id_idx on fitness_entries (activity_type_id);

create trigger fitness_entries_set_updated_at
    before update on fitness_entries
    for each row execute function moddatetime(updated_at);


-- ============================================================================
-- MODULI 6 — BURIME NJERËZORE (sectors / colleagues / contact_log)
-- CRM personal i kontakteve të punës. Vetëm info profesionale/faktike.
-- ============================================================================
create table sectors (
    id         uuid primary key default gen_random_uuid(),
    name       text not null unique,          -- p.sh. "Shitje Elektronikë"
    created_at timestamptz not null default now()
);


create table colleagues (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,                 -- Emri (i detyrueshëm)
    last_name   text,                          -- Mbiemri (opsional)
    role        text,                          -- Pozicioni (opsional): asistent, operator, përgjegjës sektori, menaxher...
    -- Çdo kontakt i takon një vendi pune; sektori s'fshihet dot nëse ka ende kontakte.
    sector_id   uuid not null references sectors (id) on delete restrict,
    phone       text,                          -- Nr. telefoni (opsional)
    email       text,                          -- Email (opsional)
    description text,                          -- Përshkrimi i punës (opsional, tekst i gjatë)
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index colleagues_sector_id_idx on colleagues (sector_id);

create trigger colleagues_set_updated_at
    before update on colleagues
    for each row execute function moddatetime(updated_at);


create table contact_log (
    id           uuid primary key default gen_random_uuid(),
    colleague_id uuid not null references colleagues (id) on delete cascade,
    contact_date date not null default current_date,
    note         text not null,               -- fushë e lirë, p.sh. "Takova, mora 2 produkte"
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

create index contact_log_colleague_id_idx on contact_log (colleague_id);
create index contact_log_contact_date_idx on contact_log (contact_date desc);

create trigger contact_log_set_updated_at
    before update on contact_log
    for each row execute function moddatetime(updated_at);


-- ============================================================================
-- MODULI 7 — HUMOR DHE ENERGJIA (mood_log)
-- Check-in ditor i shpejtë: humor + energji nga 1 në 5, plus shënim opsional.
-- Një rresht për ditë (log_date = PK), ndryshe nga sleep_log/expenses.
-- ============================================================================
create table mood_log (
    log_date   date        primary key,
    mood       smallint    not null check (mood between 1 and 5),
    energy     smallint    not null check (energy between 1 and 5),
    note       text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger mood_log_set_updated_at
    before update on mood_log
    for each row execute function moddatetime(updated_at);


-- ============================================================================
-- CILËSIME GLOBALE (app_settings)
-- Çelës/vlerë për cilësime të vogla të gjithë aplikacionit, jo të lidhura me
-- një modul të vetëm (p.sh. synimi ditor i gjumit). `value` jsonb që të mbajë
-- çdo tip vlere pa ndryshuar strukturën për çdo cilësim të ri.
-- ============================================================================
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


-- ============================================================================
-- FUND. "Shto seksion" (JSONB) planifikohet veçmas — jo pjesë e kësaj skeme.
-- ============================================================================
