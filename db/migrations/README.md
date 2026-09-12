# Migrimet e databazës

## Qëllimi
Ndryshime shtuese ndaj skemës, të numëruara me rradhë; `schema.sql` në rrënjë mbetet gjendja e plotë aktuale.

## Përmban
- `001-income-kind.sql` — shton `income.kind` ('paga' | 'tjeter') për të dalluar pagën nga të ardhurat e tjera.
- `002-habit-log-check.sql` — trigger që siguron përputhjen e `habit_log` me `habits.tracking_type` ('binary'->`done`, 'duration'->`duration_minutes`).
- `003-fitness-steps-nullable.sql` — heq `NOT NULL` nga `fitness_log.steps` (ditët e stërvitjes s'kanë hapa; matje me `activity_type` + `duration_minutes`).
- `004-hr-contacts.sql` — Moduli 6 "Burime Njerëzore": `colleagues` + `last_name/phone/email/description`, `sector_id` bëhet `NOT NULL` + `ON DELETE RESTRICT`, hiqet `is_direct`; `contact_log` + `updated_at` + trigger `moddatetime`.
- `005-activity-types.sql` — Moduli 5 ripërkufizohet: heq `fitness_log`; shton `activity_types` (emër i lirë + `units text[]` nga vokabular fiks + `daily_goal`/`goal_unit`) dhe `fitness_entries` (lidhet me një lloj, `values jsonb`, disa hyrje/ditë).
- `006-expense-categories.sql` — Moduli 1: shton `expense_categories` (emër unik + `sort_order`), listë e menaxhuar nga Cilësimet; PA FK me `expenses` (`expenses.category` mbetet tekst).
- `007-income-sources.sql` — Moduli 2: shton `income_sources` (emër unik + `sort_order`), mirror i `expense_categories`; PA FK me `income` (`income.source` mbetet tekst).
- `008-app-settings.sql` — shton `app_settings` (çelës/vlerë `jsonb`, global, jo modul-specifik); vlerë fillestare `sleep_goal_minutes = 480`.

## Lidhet me
- `schema.sql` (rrënjë) — burimi i vetëm i së vërtetës për skemën.
- Moduli 1 — Shpenzime (`expenses`, `expense_categories`).
- Moduli 2 — Të ardhura (`income`, `income_allocations`, `income_sources`).
- Moduli 3 — Gjumi (`sleep_log`), sinkronizuar me `app_settings.sleep_goal_minutes`.
- Moduli 4 — Zakone (`habits`, `habit_log`).
- Moduli 5 — Aktivitet Fizik (`activity_types`, `fitness_entries`).
- Moduli 6 — Burime Njerëzore (`sectors`, `colleagues`, `contact_log`).
- Cilësime globale (`app_settings`).
