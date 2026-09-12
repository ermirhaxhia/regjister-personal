-- ============================================================================
-- Migrimi 001 — income.kind
-- Shton kolonën 'kind' te tabela income për të dalluar llojin e të ardhurës:
--   'paga'   = pagë mujore; backend-i e ndan 50/50 te income_allocations
--   'tjeter' = të ardhura të tjera; 100% personale, pa ndarje
-- Rreshtat ekzistues marrin 'paga' nga default-i (i pranueshëm).
-- Ekzekuto te Supabase SQL Editor.
-- ============================================================================

alter table income
    add column kind text not null default 'paga'
    check (kind in ('paga', 'tjeter'));
