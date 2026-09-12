-- ============================================================================
-- Migrimi 007 — Burimet e të ardhurave (Moduli 2)
--
-- Tabelë e re `income_sources`: listë e thjeshtë emrash, e menaxhuar nga
-- ekrani i Cilësimeve. Mirror i saktë i `expense_categories` (migrimi 006).
--
-- Lidhja me `income`: PA foreign key. `income.source` mbetet `text` — emri
-- i burimit kopjohet te të ardhura kur ruhet. Kur një burim riemërtohet,
-- backend-i bën bulk-update të `income.source` (jashtë fushës së skemës).
--
-- Pa indeks shtesë: `name unique` jep tashmë indeksin e vetëm që na duhet.
--
-- Ekzekuto te Supabase SQL Editor (ose backend/run_migration.py përmes pooler-it).
-- ============================================================================

begin;

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

commit;

-- PostgREST: rifresko cache-in e skemës.
notify pgrst, 'reload schema';
