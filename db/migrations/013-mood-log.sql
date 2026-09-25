-- Modul i ri "Humor dhe Energjia": check-in ditor, një rresht/ditë (PK = log_date,
-- ndryshe nga sleep_log/expenses që lejojnë shumë rreshta/ditë).
begin;

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

commit;
notify pgrst, 'reload schema';
