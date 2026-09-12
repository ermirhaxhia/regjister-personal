-- ============================================================================
-- Migrimi 006 — Kategoritë e shpenzimeve (Moduli 1)
--
-- Tabelë e re `expense_categories`: listë e thjeshtë emrash, e menaxhuar nga
-- ekrani i Cilësimeve. Vëllim i vogël (disa dhjetëra rreshta maksimum).
--
-- Lidhja me `expenses`: PA foreign key. `expenses.category` mbetet `text` — emri
-- i kategorisë kopjohet te shpenzimi kur ruhet. Kur një kategori riemërtohet,
-- backend-i bën bulk-update të `expenses.category` (jashtë fushës së skemës).
--
-- Pa indeks shtesë: `name unique` jep tashmë indeksin e vetëm që na duhet.
--
-- Ekzekuto te Supabase SQL Editor (ose backend/run_migration.py përmes pooler-it).
-- ============================================================================

begin;

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

commit;

-- PostgREST: rifresko cache-in e skemës.
notify pgrst, 'reload schema';
