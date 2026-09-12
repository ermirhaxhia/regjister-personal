-- ============================================================================
-- Migrimi 003 — fitness_log.steps bëhet nullable
-- Modeli i ri: një ditë është OSE ecje (matet me `steps`) OSE stërvitje
-- (palestër/futboll/vrapim) e matur me `activity_type` + `duration_minutes`
-- pa hapa. Prandaj `steps` s'është më i detyrueshëm.
--
-- CHECK-u ekzistues `steps >= 0` mbetet: kur `steps` është NULL shprehja jep
-- NULL dhe constraint-i NUK shkelet, pra s'ka nevojë të rikrijohet.
-- Asnjë constraint i ri: frontend-i siguron që dita ka të paktën njërën
-- (hapa OSE activity_type+duration_minutes). Skema mbetet lejuese.
-- `entry_date` mbetet UNIQUE (një rresht/ditë).
-- Ekzekuto te Supabase SQL Editor.
-- ============================================================================

alter table fitness_log alter column steps drop not null;

-- PostgREST: rifresko cache-in e skemës nëse s'e bën vetë.
notify pgrst, 'reload schema';
