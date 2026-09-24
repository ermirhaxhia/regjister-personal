-- Moduli i Leximit: libra + sesione, lidhur me Zakonet përmes tracking_type = 'lexim'.
begin;

-- shto 'lexim' te llojet e ndjekjes së zakoneve
alter table habits drop constraint habits_tracking_type_check;
alter table habits add constraint habits_tracking_type_check
    check (tracking_type in ('binary', 'duration', 'lexim'));

create table books (
    id           uuid primary key default gen_random_uuid(),
    title        text not null,
    author       text,
    total_pages  int  not null check (total_pages > 0),
    status       text not null default 'reading' check (status in ('reading', 'finished')),
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

create trigger books_set_updated_at
    before update on books
    for each row execute function moddatetime(updated_at);

create table reading_sessions (
    id           uuid primary key default gen_random_uuid(),
    book_id      uuid not null references books (id) on delete cascade,
    session_date date not null default current_date,
    pages_read   int  not null check (pages_read > 0),
    minutes      int  check (minutes >= 0),
    note         text,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

create index reading_sessions_book_id_idx      on reading_sessions (book_id);
create index reading_sessions_session_date_idx on reading_sessions (session_date desc);

create trigger reading_sessions_set_updated_at
    before update on reading_sessions
    for each row execute function moddatetime(updated_at);

commit;
notify pgrst, 'reload schema';
