-- ============================================================================
-- MIGRIMI 015 — MODULI "RISHIKIMI JAVOR" (weekly_review)
-- Reflektim i shkurtër çdo javë: çfarë shkoi mirë / çfarë jo / një gjë për javën
-- tjetër. Numrat krahasues (shpenzime, gjumë, zakone, hapa) llogariten nga
-- module ekzistuese te backend-i, s'kërkojnë tabelë të re.
-- Një rresht/javë (week_start = PK, e hëna e javës ISO), modeluar sipas mood_log.
-- Të tria fushat janë opsionale — mund të plotësohet edhe vetëm njëra.
-- ============================================================================
begin;

create table weekly_review (
    week_start date primary key,   -- e hëna e javës (ISO week start)
    good       text,
    bad        text,
    next       text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger weekly_review_set_updated_at
    before update on weekly_review
    for each row execute function moddatetime(updated_at);

commit;
notify pgrst, 'reload schema';
