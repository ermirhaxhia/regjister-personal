-- ============================================================================
-- MIGRIMI 017 — MODULI 10 "SHKOLLA": PREZENCA NË ORAR MËSIMOR
-- class_sessions = orari fiks javor (recurring), ndërtuar/ndryshuar vetë nga
-- përdoruesi te Cilësimet kur ndryshon semestri. class_attendance = regjistrimi
-- ditor, PËR SEANCË TË VEÇANTË (jo për lëndë-ditë): një lëndë me 2 orë radhazi
-- është 2 rreshta të veçantë te class_sessions nëse përdoruesi kështu e ndan,
-- sepse ndonjëherë shkon vetëm në njërën orë.
-- ============================================================================
begin;

-- 1. Orari fiks javor.
create table class_sessions (
    id            uuid primary key default gen_random_uuid(),
    subject_name  text not null,                 -- p.sh. "Machine Learning"
    session_type  text,                           -- p.sh. "Leksion", "Seminar" (tekst i lirë, jo enum)
    professor     text,                           -- opsionale
    room          text,                           -- opsionale
    weekday       smallint not null check (weekday between 0 and 6),  -- 0=E Hënë ... 6=E Diel
    start_time    time not null,
    end_time      time not null,
    is_active     boolean not null default true,  -- soft-disable kur mbaron semestri, si habits.is_active
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),
    constraint class_sessions_end_after_start check (end_time > start_time)
);

create index class_sessions_weekday_idx on class_sessions (weekday) where is_active;

create trigger class_sessions_set_updated_at
    before update on class_sessions
    for each row execute function moddatetime(updated_at);

-- 2. Regjistrimi ditor i prezencës, një rresht për (seancë, datë).
create table class_attendance (
    id           uuid primary key default gen_random_uuid(),
    session_id   uuid not null references class_sessions (id) on delete cascade,
    class_date   date not null,
    attended     boolean not null,
    note         text,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now(),
    unique (session_id, class_date)
);

create index class_attendance_class_date_idx on class_attendance (class_date desc);

create trigger class_attendance_set_updated_at
    before update on class_attendance
    for each row execute function moddatetime(updated_at);

commit;
notify pgrst, 'reload schema';
