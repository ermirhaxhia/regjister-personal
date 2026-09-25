-- Migrimi 010 riemërtoi books->collections por harroi të përgjithësojë
-- title/author, të cilat mbetën koncepte specifike librash. "author" s'ka
-- kuptim për një koleksion gjenerik (ushtrime, projekte, etj.), ndaj hiqet;
-- "title" bëhet "name" për konsistencë me pjesën tjetër të skemës.
begin;

alter table collections rename column title to name;
alter table collections drop column author;

commit;
notify pgrst, 'reload schema';
