-- Migrimi 010 riemërtoi book_id->collection_id dhe pages_read->amount, por
-- harroi session_date->entry_date, ndërsa schema.sql dhe backend-i i ri e
-- presin kolonën si entry_date. Plotëson riemërtimin.
begin;

alter table collection_entries rename column session_date to entry_date;

commit;
notify pgrst, 'reload schema';
