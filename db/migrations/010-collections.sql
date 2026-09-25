-- Përgjithëson modulin e Leximit (books/reading_sessions) në një sistem të
-- përgjithshëm "Koleksion" me total + progres, ripërdorshëm për çdo gjë
-- (libra, ushtrime, etj.), jo vetëm lexim. Zakoni ekzistues "Lexim" ruan id-në
-- dhe historinë e tij te habit_log; ndryshon vetëm tracking_type + unit_label.
begin;

-- habits: emri i njësisë (kuptimplotë vetëm kur tracking_type = 'koleksion')
alter table habits add column unit_label text;

-- hiq check-un e vjetër PARA update-it (s'lejon 'koleksion'), migro të dhënat,
-- pastaj shto check-un e ri (nga ky moment s'ka më rreshta me 'lexim')
alter table habits drop constraint habits_tracking_type_check;

update habits set tracking_type = 'koleksion', unit_label = 'faqe'
    where tracking_type = 'lexim';

alter table habits add constraint habits_tracking_type_check
    check (tracking_type in ('binary', 'duration', 'koleksion'));

-- books -> collections: lidhur me një zakon specifik, jo më global
alter table books rename to collections;
alter table collections rename column total_pages to total_amount;

-- check-u i vjetër "books_total_pages_check" (total_pages > 0) mbetet i lidhur
-- me kolonën e riemërtuar dhe s'lejon NULL; e heqim para se ta zëvendësojmë.
alter table collections drop constraint books_total_pages_check;
alter table collections alter column total_amount drop not null;
alter table collections add constraint collections_total_amount_check
    check (total_amount is null or total_amount > 0);

alter table collections add column habit_id uuid references habits (id) on delete cascade;
-- tabela është bosh, ndaj mund të bëhet e detyrueshme direkt pa backfill
alter table collections alter column habit_id set not null;
create index collections_habit_id_idx on collections (habit_id);

alter table collections drop constraint books_status_check;
alter table collections add constraint collections_status_check
    check (status in ('active', 'paused', 'finished'));
alter table collections alter column status set default 'active';

alter trigger books_set_updated_at on collections rename to collections_set_updated_at;

-- reading_sessions -> collection_entries
alter table reading_sessions rename to collection_entries;
alter table collection_entries rename column book_id to collection_id;
alter table collection_entries rename column pages_read to amount;

alter index reading_sessions_book_id_idx rename to collection_entries_collection_id_idx;
alter index reading_sessions_session_date_idx rename to collection_entries_entry_date_idx;
alter trigger reading_sessions_set_updated_at on collection_entries rename to collection_entries_set_updated_at;

commit;
notify pgrst, 'reload schema';
