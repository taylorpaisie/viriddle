-- Administrative usage reports only. Internal classification grants no game/admin privileges.
-- Populate the exclusion list separately as database owner; no account IDs/emails in source.
begin;
create table private.analytics_internal_players (
 player_id uuid primary key references public.players(id) on delete cascade,
 reason text not null default 'Creator/testing' check(length(reason) between 1 and 120),
 added_at timestamptz not null default now()
);
alter table private.analytics_internal_players enable row level security;
-- No client policies: intentional deny-by-default, including the excluded player.
revoke all on private.analytics_internal_players from public,anon,authenticated;

create view private.usage_summary with (security_invoker=true) as
with players as (
 select p.*,exists(select 1 from private.analytics_internal_players i where i.player_id=p.id) as internal
 from public.players p
), attempts as (
 select a.*,p.internal from public.daily_attempts a join players p on p.id=a.player_id
)
select now() as measured_at,
 (select count(*) from players) as total_player_identities,
 (select count(*) from players where internal) as excluded_player_identities,
 (select count(*) from players where not internal) as other_player_identities,
 (select count(*) from players where not internal and last_active_at>=now()-interval '24 hours') as other_identities_active_last_24h,
 count(*) filter(where internal) as excluded_daily_attempts,
 count(distinct player_id) filter(where not internal) as other_daily_players,
 count(*) filter(where not internal) as other_daily_attempts_started,
 count(*) filter(where not internal and status='completed') as other_submitted_attempts,
 count(*) filter(where not internal and correct_solution=true) as other_solved_attempts,
 count(*) filter(where not internal and status='timed_out') as other_timed_out_attempts,
 count(*) filter(where not internal and status='active') as other_active_status_attempts,
 (count(*) filter(where internal)>0 and count(*) filter(where not internal)=0) as only_internal_daily_attempts
from attempts;

create view private.usage_daily with (security_invoker=true) as
with players as (
 select p.*,exists(select 1 from private.analytics_internal_players i where i.player_id=p.id) as internal
 from public.players p
), attempt_days as (
 select (a.started_at at time zone 'UTC')::date as day_utc,
 count(*) filter(where p.internal) as excluded_attempts,
 count(distinct a.player_id) filter(where not p.internal) as other_daily_players,
 count(*) filter(where not p.internal) as other_attempts_started,
 count(*) filter(where not p.internal and a.status='completed') as other_submitted,
 count(*) filter(where not p.internal and a.correct_solution=true) as other_solved,
 count(*) filter(where not p.internal and a.status='timed_out') as other_timed_out
 from public.daily_attempts a join players p on p.id=a.player_id group by 1
), signup_days as (
 select (created_at at time zone 'UTC')::date as day_utc,
 count(*) filter(where not internal) as new_other_identities from players group by 1
)
select coalesce(a.day_utc,s.day_utc) as day_utc,
 coalesce(s.new_other_identities,0) as new_other_identities,
 coalesce(a.excluded_attempts,0) as excluded_attempts,
 coalesce(a.other_daily_players,0) as other_daily_players,
 coalesce(a.other_attempts_started,0) as other_attempts_started,
 coalesce(a.other_submitted,0) as other_submitted,
 coalesce(a.other_solved,0) as other_solved,
 coalesce(a.other_timed_out,0) as other_timed_out
from attempt_days a full join signup_days s using(day_utc);
revoke all on private.usage_summary,private.usage_daily from public,anon,authenticated;
commit;
