-- Optional case ratings. No changes to attempts, scores, evidence or daily scheduling.
begin;
create table public.case_feedback (
 attempt_id uuid primary key references public.daily_attempts(id) on delete cascade,
 rating text not null check(rating in ('satisfying','confusing','too_easy','too_hard')),
 created_at timestamptz not null default clock_timestamp(),
 updated_at timestamptz not null default clock_timestamp()
);
alter table public.case_feedback enable row level security;
revoke all on public.case_feedback from public,anon,authenticated;
grant select on public.case_feedback to authenticated;
grant insert(attempt_id,rating),update(rating) on public.case_feedback to authenticated;

create policy own_finished_feedback_read on public.case_feedback for select to authenticated
using(exists(select 1 from public.daily_attempts a where a.id=attempt_id and a.player_id=(select auth.uid()) and a.status in ('completed','timed_out')));
create policy own_finished_feedback_insert on public.case_feedback for insert to authenticated
with check(exists(select 1 from public.daily_attempts a where a.id=attempt_id and a.player_id=(select auth.uid()) and a.status in ('completed','timed_out')));
create policy own_finished_feedback_update on public.case_feedback for update to authenticated
using(exists(select 1 from public.daily_attempts a where a.id=attempt_id and a.player_id=(select auth.uid()) and a.status in ('completed','timed_out')))
with check(exists(select 1 from public.daily_attempts a where a.id=attempt_id and a.player_id=(select auth.uid()) and a.status in ('completed','timed_out')));

create function private.case_feedback_timestamp() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 new.updated_at:=clock_timestamp();
 return new;
end $$;
revoke all on function private.case_feedback_timestamp() from public,anon,authenticated;
create trigger case_feedback_timestamp before update on public.case_feedback
for each row execute function private.case_feedback_timestamp();

-- Invoker permissions + table RLS enforce ownership even if called directly through the API.
create function public.outbreak_case_feedback(p_attempt_id uuid,p_rating text default null) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare result text;
begin
 if auth.uid() is null then raise exception 'Continue as guest or sign in first.' using errcode='42501'; end if;
 if p_rating is not null then
  if p_rating not in ('satisfying','confusing','too_easy','too_hard') then raise exception 'Choose a valid case rating.' using errcode='22023'; end if;
  insert into public.case_feedback(attempt_id,rating) values(p_attempt_id,p_rating)
  on conflict(attempt_id) do update set rating=excluded.rating;
 end if;
 select f.rating into result from public.case_feedback f where f.attempt_id=p_attempt_id;
 return jsonb_build_object('rating',result);
end $$;
revoke all on function public.outbreak_case_feedback(uuid,text) from public,anon;
grant execute on function public.outbreak_case_feedback(uuid,text) to authenticated;
commit;
