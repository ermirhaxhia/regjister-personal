-- ============================================================================
-- Migrimi 002 — habit_log_check_type
-- Kontroll integriteti: rreshti te habit_log duhet të përputhet me llojin e
-- ndjekjes së zakonit (habits.tracking_type):
--   'binary'   -> done NUK mund të jetë NULL (duration_minutes lejohet NULL)
--   'duration' -> duration_minutes NUK mund të jetë NULL (done lejohet NULL)
-- Constraint-i habit_log_has_value nuk mjafton se s'e njeh tipin e zakonit.
-- Ekzekuto te Supabase SQL Editor.
-- ============================================================================

create or replace function habit_log_check_type()
returns trigger
language plpgsql
as $$
declare
    v_tracking_type text;
begin
    select tracking_type into v_tracking_type
    from habits
    where id = new.habit_id;

    if v_tracking_type = 'binary' and new.done is null then
        raise exception 'Zakoni binar kërkon vlerë te "done" (nuk mund të jetë NULL).';
    elsif v_tracking_type = 'duration' and new.duration_minutes is null then
        raise exception 'Zakoni me kohëzgjatje kërkon vlerë te "duration_minutes" (nuk mund të jetë NULL).';
    end if;

    return new;
end;
$$;

create trigger habit_log_check_type_trg
    before insert or update on habit_log
    for each row execute function habit_log_check_type();
