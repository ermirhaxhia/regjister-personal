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
- `009-reading.sql` — shton `tracking_type = 'lexim'` te `habits`, `books` + `reading_sessions` për modulin e Leximit.
- `010-collections.sql` — përgjithëson `books`/`reading_sessions` në `collections`/`collection_entries` (total opsional, lidhur me `habit_id`, `status` 'active'|'paused'|'finished'); `habits.tracking_type` 'lexim' -> 'koleksion' + `unit_label`.
- `013-mood-log.sql` — Moduli 7 "Humor dhe Energjia": shton `mood_log` (check-in ditor, `log_date` PK, `mood`/`energy` 1-5, `note` opsionale).
- `014-work-sessions.sql` — Moduli 8 "Orë Pune": shton `work_sessions` (start/end `timestamptz`, `work_date`, `workplace_id` -> `sectors` ON DELETE SET NULL, kohëzgjatje e llogaritur), modeluar sipas `sleep_log`.
- `015-weekly-review.sql` — Moduli 9 "Rishikimi Javor": shton `weekly_review` (`week_start` PK, `good`/`bad`/`next` opsionale), modeluar sipas `mood_log`; numrat krahasues llogariten nga backend-i, jo nga kjo tabelë.
- `016-habit-count-type.sql` — shton `tracking_type = 'numer'` te `habits` (p.sh. "kafe në ditë"); shton `habit_log.count`, zgjeron `habit_log_has_value` dhe trigger-in `habit_log_check_type`.

## Lidhet me
- `schema.sql` (rrënjë) — burimi i vetëm i së vërtetës për skemën.
- Moduli 1 — Shpenzime (`expenses`, `expense_categories`).
- Moduli 2 — Të ardhura (`income`, `income_allocations`, `income_sources`).
- Moduli 3 — Gjumi (`sleep_log`), sinkronizuar me `app_settings.sleep_goal_minutes`.
- Moduli 4 — Zakone (`habits`, `habit_log`).
- Moduli 5 — Aktivitet Fizik (`activity_types`, `fitness_entries`).
- Moduli 6 — Burime Njerëzore (`sectors`, `colleagues`, `contact_log`).
- Moduli i Koleksioneve (`collections`, `collection_entries`), lidhur me `habits.tracking_type = 'koleksion'`.
- Moduli 7 — Humor dhe Energjia (`mood_log`).
- Moduli 8 — Orë Pune (`work_sessions`), lidhur me `sectors` (vendi i punës).
- Moduli 9 — Rishikimi Javor (`weekly_review`); numrat krahasues vijnë nga modulet e tjera te backend-i.
- Cilësime globale (`app_settings`).
