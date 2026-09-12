-- ============================================================================
-- Migrimi 004 — Burime Njerëzore (Moduli 6): CRM personal i kontakteve të punës
-- Tabelat sectors / colleagues / contact_log ekzistojnë, por moduli s'u ndërtua
-- kurrë — s'ka të dhëna reale në to.
--
-- Ç'ndryshon:
--   colleagues  : + last_name, phone, email, description  (opsionale, text)
--                 sector_id  ->  NOT NULL  +  ON DELETE RESTRICT
--                 - is_direct  (modeli i vjetër "5 kolegët e zyrës"; pa përdorim)
--   contact_log : + updated_at  + trigger moddatetime  (editohet si hyrjet e tjera)
--
-- KUJDES 1: `alter column sector_id set not null` DËSHTON nëse ndonjë rresht e ka
--           sector_id NULL. S'duhet të ndodhë (moduli s'është përdorur). Nëse
--           ndodh: cakto një sektor te ata rreshta ose fshiji, pastaj rieaktivizo.
-- KUJDES 2: kalimi `on delete set null` -> `on delete restrict` kërkon
--           drop + recreate të constraint-it FK. Emri i tij, i gjeneruar nga
--           CREATE TABLE me `references` inline, është "colleagues_sector_id_fkey".
--           Nëse DB-ja jote e ka ndryshe, gjeje dhe zëvendësoje te hapi 3:
--             select conname from pg_constraint
--             where conrelid = 'colleagues'::regclass and contype = 'f';
--
-- Ekzekuto te Supabase SQL Editor.
-- ============================================================================

begin;

-- 1) colleagues — kolonat e reja (opsionale; s'prekin rreshtat ekzistues) -----
alter table colleagues add column last_name   text;   -- Mbiemri
alter table colleagues add column phone       text;   -- Nr. telefoni
alter table colleagues add column email       text;   -- Email
alter table colleagues add column description text;    -- Përshkrimi i punës (tekst i gjatë)

-- 2) colleagues.sector_id — bëhet i detyrueshëm ------------------------------
alter table colleagues alter column sector_id set not null;

-- 3) colleagues.sector_id — FK: ON DELETE SET NULL -> ON DELETE RESTRICT -----
--    Çdo kontakt i takon një vendi pune; s'lejohet fshirja e një sektori që ka
--    ende kontakte. Emri i constraint-it mbahet i njëjtë me schema.sql.
alter table colleagues drop constraint colleagues_sector_id_fkey;
alter table colleagues add constraint colleagues_sector_id_fkey
    foreign key (sector_id) references sectors (id) on delete restrict;

-- 4) colleagues — hiqet is_direct ------------------------------------------
--    S'humbet asnjë e dhënë reale (kolona s'u shkrua kurrë).
alter table colleagues drop column is_direct;

-- 5) contact_log — updated_at + trigger (si tabelat e tjera) --------------
--    schema.sql aktual e ka tashmë; IF NOT EXISTS + re-create e bëjnë të sigurt
--    edhe nëse kolona/trigger-i ekziston në DB-në tënde.
alter table contact_log add column if not exists updated_at timestamptz not null default now();

drop trigger if exists contact_log_set_updated_at on contact_log;
create trigger contact_log_set_updated_at
    before update on contact_log
    for each row execute function moddatetime(updated_at);

commit;

-- PostgREST: rifresko cache-in e skemës.
notify pgrst, 'reload schema';
