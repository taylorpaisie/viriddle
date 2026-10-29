-- OUTBREAK v1. Apply as the project database owner. No secrets in public schemas.
begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table public.players (
 id uuid primary key references auth.users(id) on delete cascade,
 username text not null default ('Investigator-' || substr(gen_random_uuid()::text,1,8)) check (username ~ '^[A-Za-z0-9_ -]{3,24}$'),
 created_at timestamptz not null default now(), last_active_at timestamptz not null default now(),
 public_profile_enabled boolean not null default false, tutorial_completed_at timestamptz
);
create unique index players_username_unique on public.players(lower(username));
create table public.daily_cases (
 id uuid primary key default gen_random_uuid(), case_date date not null unique,
 puzzle_version integer not null default 1 check(puzzle_version>0), published_at timestamptz not null,
 public_data jsonb not null check(jsonb_typeof(public_data)='object')
);
create table private.case_secrets (
 case_id uuid primary key references public.daily_cases(id) on delete cascade,
 solution jsonb not null check(jsonb_typeof(solution)='object'),
 reports jsonb not null check(jsonb_typeof(reports)='object')
);
create table private.evidence_catalog (id text primary key, cost integer not null check(cost between 0 and 100));
insert into private.evidence_catalog values ('bookings',4),('windows',6),('interviews',10),('contacts',12),('outside',14),('genomics',18);
create table public.daily_attempts (
 id uuid primary key default gen_random_uuid(), player_id uuid not null references public.players(id) on delete cascade,
 case_id uuid not null references public.daily_cases(id), started_at timestamptz not null default clock_timestamp(),
 completed_at timestamptz, elapsed_seconds integer check(elapsed_seconds between 0 and 150),
 evidence_used text[] not null default '{}', selected_patient integer check(selected_patient between 0 and 5),
 evidence_cost integer not null default 0 check(evidence_cost between 0 and 64),
 base_points integer not null default 0, speed_bonus integer not null default 0 check(speed_bonus between 0 and 50),
 score integer check(score between 0 and 100), correct_solution boolean,
 status text not null default 'active' check(status in ('active','completed','timed_out')),
 unique(player_id,case_id),
 check((status='active' and completed_at is null and score is null and correct_solution is null) or
       (status<>'active' and completed_at is not null and score is not null and correct_solution is not null and elapsed_seconds is not null))
);
create index attempts_player_history on public.daily_attempts(player_id,started_at desc);
create index attempts_daily_ranking on public.daily_attempts(case_id,score desc,elapsed_seconds,completed_at) where status<>'active';
create index attempts_active_deadline on public.daily_attempts(started_at) where status='active';
create table public.attempt_events (
 id bigint generated always as identity primary key, attempt_id uuid not null references public.daily_attempts(id) on delete cascade,
 event_type text not null check(event_type in ('started','purchase','selection','submitted','timed_out')),
 event_timestamp timestamptz not null default clock_timestamp(), event_data jsonb not null default '{}'
);
create index events_attempt on public.attempt_events(attempt_id,event_timestamp);
create unique index events_one_purchase on public.attempt_events(attempt_id,(event_data->>'evidence')) where event_type='purchase';
create table private.request_limits (player_id uuid not null references auth.users(id) on delete cascade, bucket timestamptz not null, count integer not null, primary key(player_id,bucket));
-- Reserved group structure. No membership API or client grants in this release.
create table private.friend_groups(id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.players(id) on delete cascade, name text not null);
create table private.friend_members(group_id uuid references private.friend_groups(id) on delete cascade,player_id uuid references public.players(id) on delete cascade,primary key(group_id,player_id));
alter table public.players enable row level security;
alter table public.daily_cases enable row level security;
alter table public.daily_attempts enable row level security;
alter table public.attempt_events enable row level security;
revoke all on public.players,public.daily_cases,public.daily_attempts,public.attempt_events from anon,authenticated;
grant select on public.players,public.daily_cases,public.daily_attempts,public.attempt_events to authenticated;
create policy own_player on public.players for select to authenticated using(id=(select auth.uid()));
create policy released_cases on public.daily_cases for select to authenticated using(published_at<=now() and case_date<=(now() at time zone 'UTC')::date);
create policy own_attempts on public.daily_attempts for select to authenticated using(player_id=(select auth.uid()));
create policy own_events on public.attempt_events for select to authenticated using(exists(select 1 from public.daily_attempts a where a.id=attempt_id and a.player_id=(select auth.uid())));

create function private.guard() returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); n integer;
begin
 if u is null then raise exception 'Sign in or continue as guest first.' using errcode='42501'; end if;
 insert into private.request_limits values(u,date_trunc('minute',clock_timestamp()),1)
 on conflict(player_id,bucket) do update set count=private.request_limits.count+1 returning count into n;
 if n>90 then raise exception 'Too many requests. Try again in a minute.' using errcode='P0001'; end if;
 insert into public.players(id) values(u) on conflict(id) do nothing;
 update public.players set last_active_at=clock_timestamp() where id=u;
 return u;
end $$;
create function private.expire_one(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare a public.daily_attempts;
begin
 select * into a from public.daily_attempts where id=p_id for update;
 if a.status='active' and clock_timestamp()>=a.started_at+interval '150 seconds' then
  update public.daily_attempts set status='timed_out',completed_at=started_at+interval '150 seconds',elapsed_seconds=150,score=0,correct_solution=false,base_points=0,speed_bonus=0 where id=a.id;
  insert into public.attempt_events(attempt_id,event_type) values(a.id,'timed_out');
 end if;
end $$;
create function private.expire_attempts() returns integer language plpgsql security definer set search_path='' as $$
declare a record; n integer:=0;
begin
 for a in select id from public.daily_attempts where status='active' and started_at<=clock_timestamp()-interval '150 seconds' loop
  perform private.expire_one(a.id); n:=n+1;
 end loop;
 delete from private.request_limits where bucket<clock_timestamp()-interval '1 day';
 return n;
end $$;
create function private.snapshot(p_case uuid,p_user uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare c public.daily_cases; a public.daily_attempts; payload jsonb; report jsonb:='{}'; k text;
begin
 select * into c from public.daily_cases where id=p_case and published_at<=clock_timestamp() and case_date<=(clock_timestamp() at time zone 'UTC')::date;
 if c.id is null then raise exception 'This case has not been published.'; end if;
 select * into a from public.daily_attempts where player_id=p_user and case_id=c.id;
 if a.id is not null then perform private.expire_one(a.id); select * into a from public.daily_attempts where id=a.id; end if;
 if a.id is not null then
  foreach k in array a.evidence_used loop select report || jsonb_build_object(k,s.reports->k) into report from private.case_secrets s where s.case_id=c.id; end loop;
 end if;
 payload:=jsonb_build_object('case_id',c.id,'case_date',c.case_date,'number',lpad((c.case_date-date '2026-10-02'+1)::text,3,'0'),'case',c.public_data,'server_now',clock_timestamp(),'attempt',case when a.id is null then null else to_jsonb(a) end,'reports',report);
 if a.status<>'active' then payload:=payload||jsonb_build_object('solution',(select solution from private.case_secrets where case_id=c.id)); end if;
 return payload;
end $$;
create function public.outbreak_daily(p_case_id uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; c uuid;
begin
 u:=private.guard();
 if p_case_id is null then
  -- Preserve an in-flight investigation across a midnight refresh.
  select case_id into c from public.daily_attempts where player_id=u and status='active' and started_at+interval '150 seconds'>clock_timestamp() order by started_at desc limit 1;
  if c is null then select id into c from public.daily_cases where case_date=(clock_timestamp() at time zone 'UTC')::date and published_at<=clock_timestamp(); end if;
 else c:=p_case_id; end if;
 if c is null then raise exception 'Today’s case is not published yet. Please try again later.'; end if;
 return private.snapshot(c,u);
end $$;
create function public.outbreak_action(p_action text,p_case_id uuid,p_evidence text default null,p_selected integer default null) returns jsonb language plpgsql security definer set search_path='' as $$
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
  if ms>=150000 then perform private.expire_one(a.id); return private.snapshot(c.id,u); end if;
  select (solution->>'source')::integer=target into correct from private.case_secrets where case_id=c.id;
  if correct is null then raise exception 'Solution unavailable. Please contact the creator.'; end if;
  bonus:=case when correct then ceil((150000-greatest(0,ms))/3000)::integer else 0 end;
  update public.daily_attempts set status='completed',selected_patient=target,completed_at=clock_timestamp(),elapsed_seconds=least(150,ceil(greatest(0,ms)/1000)::integer),correct_solution=correct,base_points=case when correct then 50 else 0 end,speed_bonus=bonus,score=case when correct then greatest(0,50+bonus-evidence_cost) else 0 end where id=a.id;
  insert into public.attempt_events(attempt_id,event_type,event_data) values(a.id,'submitted',jsonb_build_object('patient',target));
 elsif p_action not in ('begin','resume') then raise exception 'Unknown action.';
 end if;
 return private.snapshot(c.id,u);
end $$;
create function public.outbreak_save_profile(p_username text default null,p_public boolean default null,p_tutorial boolean default false) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid;
begin
 u:=private.guard();
 if p_username is not null and (trim(p_username)!~'^[A-Za-z0-9_ -]{3,24}$') then raise exception 'Use 3–24 letters, numbers, spaces, underscores or hyphens.'; end if;
 update public.players set username=coalesce(trim(p_username),username),public_profile_enabled=coalesce(p_public,public_profile_enabled),tutorial_completed_at=case when p_tutorial then coalesce(tutorial_completed_at,clock_timestamp()) else tutorial_completed_at end where id=u;
 return (select to_jsonb(p) from public.players p where id=u);
end $$;
create function private.summary(p_user uuid) returns jsonb language sql stable security definer set search_path='' as $$
 with done as(select a.*,c.case_date from public.daily_attempts a join public.daily_cases c on c.id=a.case_id where player_id=p_user and status<>'active'),
 islands as(select case_date,case_date-(row_number() over(order by case_date))::integer as grp from done),
 streaks as(select count(*) as n,max(case_date) as ending from islands group by grp)
 select jsonb_build_object('total',count(*),'solved',count(*) filter(where correct_solution),'points',coalesce(sum(score),0),'average',coalesce(round(avg(score)),0),'best',coalesce(max(score),0),'average_time',coalesce(round(avg(elapsed_seconds)),0),'best_time',min(elapsed_seconds) filter(where correct_solution),'success_rate',coalesce(round(100.0*count(*) filter(where correct_solution)/nullif(count(*),0)),0),'longest',coalesce((select max(n) from streaks),0),'current',coalesce((select n from streaks where ending>=((now() at time zone 'UTC')::date-1) order by ending desc limit 1),0)) from done;
$$;
create function public.outbreak_profile() returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; expired record;
begin
 u:=private.guard(); for expired in select id from public.daily_attempts where player_id=u and status='active' loop perform private.expire_one(expired.id); end loop;
 return jsonb_build_object('player',(select to_jsonb(p) from public.players p where id=u),'stats',private.summary(u),'history',coalesce((select jsonb_agg(r order by r.case_date desc) from(select c.case_date,a.score,a.correct_solution,a.elapsed_seconds,a.evidence_used,c.public_data->>'title' as title from public.daily_attempts a join public.daily_cases c on c.id=a.case_id where a.player_id=u and a.status<>'active' order by c.case_date desc limit 366) r),'[]'::jsonb));
end $$;
create function public.outbreak_leaderboard(p_scope text default 'today',p_offset integer default 0) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; data jsonb;
begin
 u:=private.guard();
 if p_scope not in ('today','all') or p_offset not between 0 and 10000 then raise exception 'Invalid leaderboard page.'; end if;
 -- Only explicitly opted-in, permanent accounts. No emails, real names, avatars or auth metadata.
 with aggregate_scores as (
  select p.id,p.username,count(*) as completed,sum(a.score) as points,sum(a.elapsed_seconds) as elapsed,min(a.completed_at) as first_completed
  from public.players p join auth.users au on au.id=p.id join public.daily_attempts a on a.player_id=p.id join public.daily_cases c on c.id=a.case_id
  where p.public_profile_enabled and not coalesce(au.is_anonymous,false) and a.status<>'active' and (p_scope='all' or c.case_date=(now() at time zone 'UTC')::date)
  group by p.id,p.username
 ), ranked as(select *,row_number() over(order by points desc,elapsed asc,first_completed,id) as position from aggregate_scores),
 paged as(select * from ranked order by position limit 25 offset p_offset)
 select jsonb_build_object('rows',coalesce((select jsonb_agg(jsonb_build_object('position',position,'username',username,'score',points,'elapsed_seconds',elapsed,'completed',completed,'career_completed',(private.summary(id)->>'total')::integer,'current_streak',(private.summary(id)->>'current')::integer)) from paged),'[]'::jsonb),'mine',(select jsonb_build_object('position',position,'username',username,'score',points,'elapsed_seconds',elapsed,'completed',completed,'career_completed',(private.summary(id)->>'total')::integer,'current_streak',(private.summary(id)->>'current')::integer) from ranked where id=u),'total',(select count(*) from ranked)) into data;
 return data;
end $$;
-- Default PUBLIC function execution is deliberately revoked for all new functions.
revoke all on all functions in schema private from public,anon,authenticated;
revoke all on function public.outbreak_daily(uuid),public.outbreak_action(text,uuid,text,integer),public.outbreak_save_profile(text,boolean,boolean),public.outbreak_profile(),public.outbreak_leaderboard(text,integer) from public,anon;
grant execute on function public.outbreak_daily(uuid),public.outbreak_action(text,uuid,text,integer),public.outbreak_save_profile(text,boolean,boolean),public.outbreak_profile(),public.outbreak_leaderboard(text,integer) to authenticated;
create function public.outbreak_archive() returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid;
begin
 u:=private.guard();
 return coalesce((select jsonb_agg(r order by case_date desc) from (select c.id,c.case_date,c.public_data->>'title' as title,exists(select 1 from public.daily_attempts a where a.case_id=c.id and a.player_id=u and a.status<>'active') as completed from public.daily_cases c where c.case_date<(clock_timestamp() at time zone 'UTC')::date and clock_timestamp()>=((c.case_date+1)::timestamp at time zone 'UTC')+interval '150 seconds' and c.published_at<=clock_timestamp() order by c.case_date desc limit 90) r),'[]'::jsonb);
end $$;
create function public.outbreak_replay(p_case_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; c public.daily_cases;
begin
 u:=private.guard();select * into c from public.daily_cases where id=p_case_id and case_date<(clock_timestamp() at time zone 'UTC')::date and clock_timestamp()>=((case_date+1)::timestamp at time zone 'UTC')+interval '150 seconds' and published_at<=clock_timestamp();
 if c.id is null then raise exception 'Only released past cases are available for practice.'; end if;
 return jsonb_build_object('case_id',c.id,'case_date',c.case_date,'number',lpad((c.case_date-date '2026-10-02'+1)::text,3,'0'),'case',c.public_data,'server_now',clock_timestamp(),'attempt',null,'reports',(select reports from private.case_secrets where case_id=c.id),'solution',(select solution from private.case_secrets where case_id=c.id));
end $$;
revoke all on function public.outbreak_archive(),public.outbreak_replay(uuid) from public,anon;
grant execute on function public.outbreak_archive(),public.outbreak_replay(uuid) to authenticated;
commit;
