-- Four-minute investigations. Apply after 202610290001_outbreak.sql.
-- Existing official attempts retain their original 150-second window and recorded results.
begin;
alter table public.daily_attempts add column duration_seconds integer not null default 150 check(duration_seconds between 30 and 1800);
alter table public.daily_attempts alter column duration_seconds set default 240;
alter table public.daily_attempts drop constraint daily_attempts_elapsed_seconds_check;
alter table public.daily_attempts add constraint attempt_elapsed_within_duration check(elapsed_seconds between 0 and duration_seconds);
create or replace function private.expire_one(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare a public.daily_attempts;
begin
 select * into a from public.daily_attempts where id=p_id for update;
 if a.status='active' and clock_timestamp()>=a.started_at+make_interval(secs=>a.duration_seconds) then
  update public.daily_attempts set status='timed_out',completed_at=started_at+make_interval(secs=>a.duration_seconds),elapsed_seconds=a.duration_seconds,score=0,correct_solution=false,base_points=0,speed_bonus=0 where id=a.id;
  insert into public.attempt_events(attempt_id,event_type) values(a.id,'timed_out');
 end if;
end $$;

create or replace function private.expire_attempts() returns integer language plpgsql security definer set search_path='' as $$
declare a record; n integer:=0;
begin
 for a in select id from public.daily_attempts where status='active' and started_at+make_interval(secs=>duration_seconds)<=clock_timestamp() loop
  perform private.expire_one(a.id); n:=n+1;
 end loop;
 delete from private.request_limits where bucket<clock_timestamp()-interval '1 day';
 return n;
end $$;

create or replace function public.outbreak_daily(p_case_id uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; c uuid;
begin
 u:=private.guard();
 if p_case_id is null then
  -- Preserve an in-flight investigation across a midnight refresh.
  select case_id into c from public.daily_attempts where player_id=u and status='active' and started_at+make_interval(secs=>duration_seconds)>clock_timestamp() order by started_at desc limit 1;
  if c is null then select id into c from public.daily_cases where case_date=(clock_timestamp() at time zone 'UTC')::date and published_at<=clock_timestamp(); end if;
 else c:=p_case_id; end if;
 if c is null then raise exception 'Today’s case is not published yet. Please try again later.'; end if;
 return private.snapshot(c,u);
end $$;

create or replace function public.outbreak_action(p_action text,p_case_id uuid,p_evidence text default null,p_selected integer default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; a public.daily_attempts; c public.daily_cases; price integer; ms numeric; correct boolean; bonus integer; target integer;
begin
 u:=private.guard();
 select * into c from public.daily_cases where id=p_case_id and published_at<=clock_timestamp();
 if c.id is null then raise exception 'Case unavailable.'; end if;
 if p_action='begin' then
  if c.case_date<>(clock_timestamp() at time zone 'UTC')::date then raise exception 'Only today’s case can start an official attempt.'; end if;
  insert into public.daily_attempts(player_id,case_id) values(u,c.id) on conflict(player_id,case_id) do nothing returning * into a;
  if a.id is not null then insert into public.attempt_events(attempt_id,event_type) values(a.id,'started'); end if;
 end if;
 select * into a from public.daily_attempts where player_id=u and case_id=c.id for update;
 if a.id is null then raise exception 'Begin the investigation first.'; end if;
 perform private.expire_one(a.id); select * into a from public.daily_attempts where id=a.id;
 if a.status<>'active' then return private.snapshot(c.id,u); end if;
 if p_action='purchase' then
  select cost into price from private.evidence_catalog where id=p_evidence;
  if price is null then raise exception 'Unknown evidence category.'; end if;
  if not(p_evidence=any(a.evidence_used)) then
   update public.daily_attempts set evidence_used=array_append(evidence_used,p_evidence),evidence_cost=evidence_cost+price where id=a.id;
   insert into public.attempt_events(attempt_id,event_type,event_data) values(a.id,'purchase',jsonb_build_object('evidence',p_evidence,'cost',price));
  end if;
 elsif p_action='select' then
  if p_selected is null or p_selected not between 0 and 5 then raise exception 'Select a valid patient.'; end if;
  if a.selected_patient is distinct from p_selected then
   update public.daily_attempts set selected_patient=p_selected where id=a.id;
   insert into public.attempt_events(attempt_id,event_type,event_data) values(a.id,'selection',jsonb_build_object('patient',p_selected));
  end if;
 elsif p_action='submit' then
  target:=coalesce(p_selected,a.selected_patient);
  if target is null or target not between 0 and 5 then raise exception 'Select a valid patient.'; end if;
  ms:=extract(epoch from (clock_timestamp()-a.started_at))*1000;
  if ms>=(a.duration_seconds*1000) then perform private.expire_one(a.id); return private.snapshot(c.id,u); end if;
  select (solution->>'source')::integer=target into correct from private.case_secrets where case_id=c.id;
  if correct is null then raise exception 'Solution unavailable. Please contact the creator.'; end if;
  bonus:=case when correct then ceil(((a.duration_seconds*1000)-greatest(0,ms))/(a.duration_seconds*1000.0/50))::integer else 0 end;
  update public.daily_attempts set status='completed',selected_patient=target,completed_at=clock_timestamp(),elapsed_seconds=least(a.duration_seconds,ceil(greatest(0,ms)/1000)::integer),correct_solution=correct,base_points=case when correct then 50 else 0 end,speed_bonus=bonus,score=case when correct then greatest(0,50+bonus-evidence_cost) else 0 end where id=a.id;
  insert into public.attempt_events(attempt_id,event_type,event_data) values(a.id,'submitted',jsonb_build_object('patient',target));
 elsif p_action not in ('begin','resume') then raise exception 'Unknown action.';
 end if;
 return private.snapshot(c.id,u);
end $$;

create or replace function public.outbreak_archive() returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid;
begin
 u:=private.guard();
 return coalesce((select jsonb_agg(r order by case_date desc) from (select c.id,c.case_date,c.public_data->>'title' as title,exists(select 1 from public.daily_attempts a where a.case_id=c.id and a.player_id=u and a.status<>'active') as completed from public.daily_cases c where c.case_date<(clock_timestamp() at time zone 'UTC')::date and clock_timestamp()>=((c.case_date+1)::timestamp at time zone 'UTC')+interval '240 seconds' and c.published_at<=clock_timestamp() order by c.case_date desc limit 90) r),'[]'::jsonb);
end $$;

create or replace function public.outbreak_replay(p_case_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; c public.daily_cases;
begin
 u:=private.guard();select * into c from public.daily_cases where id=p_case_id and case_date<(clock_timestamp() at time zone 'UTC')::date and clock_timestamp()>=((case_date+1)::timestamp at time zone 'UTC')+interval '240 seconds' and published_at<=clock_timestamp();
 if c.id is null then raise exception 'Only released past cases are available for practice.'; end if;
 return jsonb_build_object('case_id',c.id,'case_date',c.case_date,'number',lpad((c.case_date-date '2026-10-02'+1)::text,3,'0'),'case',c.public_data,'server_now',clock_timestamp(),'attempt',null,'reports',(select reports from private.case_secrets where case_id=c.id),'solution',(select solution from private.case_secrets where case_id=c.id));
end $$;
commit;
