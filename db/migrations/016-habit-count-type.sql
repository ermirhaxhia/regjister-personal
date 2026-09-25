-- ============================================================================
-- MIGRIMI 016 — LLOJ I RI ZAKONI "numer" (habits.tracking_type)
-- Për zakone si "kafe në ditë" ose "gota uji": regjistrohet thjesht një numër
-- i plotë çdo ditë (ndryshe nga 'binary' po/jo, 'duration' minuta, ose
-- 'koleksion' total+hyrje kumulative).
-- ============================================================================
begin;

-- 1. Zgjerohet CHECK-u i habits.tracking_type me vlerën 'numer'.
alter table habits drop constraint habits_tracking_type_check;
alter table habits add constraint habits_tracking_type_check
    check (tracking_type in ('binary', 'duration', 'koleksion', 'numer'));

-- 2. Kolonë e re për vlerën numerike ditore (kuptimplote vetëm kur tracking_type = 'numer').
alter table habit_log add column count int check (count >= 0);

-- 3. Zgjerohet constraint-i habit_log_has_value që të pranojë edhe rreshta me vetëm 'count'.
alter table habit_log drop constraint habit_log_has_value;
alter table habit_log add constraint habit_log_has_value
    check (done is not null or duration_minutes is not null or count is not null);

-- 4. Trigger-i i tipit përfshin degën 'numer'.
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
    elsif v_tracking_type = 'numer' and new.count is null then
        raise exception 'Zakoni i llojit numër kërkon vlerë te "count" (nuk mund të jetë NULL).';
    end if;

    return new;
end;
$$;

commit;
notify pgrst, 'reload schema';
