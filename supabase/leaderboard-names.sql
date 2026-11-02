-- Pending migration source: generate a migration with `supabase migration new leaderboard_names`,
-- then copy this transaction into that generated file before deployment.
begin;
create or replace function private.leaderboard_name_error(p_name text) returns text
language plpgsql immutable set search_path='' as $$
declare n text:=trim(p_name); compact text:=regexp_replace(lower(trim(p_name)),'[^a-z0-9]','','g');
begin
 if n is null or n !~ '^[A-Za-z0-9_ -]{3,20}$' or n !~ '[A-Za-z0-9]' then return 'Use 3–20 letters, numbers, spaces, underscores or hyphens.'; end if;
 if compact ~ '^(admin|administrator|moderator|support|staff|system|official|viriddle)$' or compact ~ '^investigator[0-9a-f]{8}$' then return 'Please choose a different name; that name is reserved.'; end if;
 if compact ~ 'fuck|shit|nigger|nigga|cunt' then return 'Please choose a name suitable for a public leaderboard.'; end if;
 return null;
end $$;
revoke all on function private.leaderboard_name_error(text) from public,anon,authenticated;
alter table public.players add column username_chosen boolean not null default false;
-- Preserve eligible chosen names and opt-ins; generated names must be replaced.
update public.players set username_chosen=true where private.leaderboard_name_error(username) is null;
update public.players set public_profile_enabled=false where not username_chosen;
alter table public.players add constraint public_name_required check (not public_profile_enabled or username_chosen);
create or replace function public.outbreak_save_profile(p_username text default null,p_public boolean default null,p_tutorial boolean default false) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; invalid text; chosen boolean;
begin
 u:=private.guard();
 if p_username is not null then
  invalid:=private.leaderboard_name_error(p_username);
  if invalid is not null then raise exception '%',invalid; end if;
 end if;
 select username_chosen into chosen from public.players where id=u for update;
 if p_public is true and p_username is null and not chosen then raise exception 'Choose a display name before joining the public leaderboard.'; end if;
 update public.players set username=coalesce(trim(p_username),username),username_chosen=(chosen or p_username is not null),public_profile_enabled=coalesce(p_public,public_profile_enabled),tutorial_completed_at=case when p_tutorial then coalesce(tutorial_completed_at,clock_timestamp()) else tutorial_completed_at end where id=u;
 return (select to_jsonb(p) from public.players p where id=u);
exception when unique_violation then raise exception 'That name is taken. Please choose another.';
end $$;
revoke all on function public.outbreak_save_profile(text,boolean,boolean) from public,anon;
grant execute on function public.outbreak_save_profile(text,boolean,boolean) to authenticated;
-- Public scores only; equal point totals share a competition rank.
create or replace function public.outbreak_leaderboard(p_scope text default 'today',p_offset integer default 0) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; data jsonb;
begin
 u:=private.guard();
 if p_scope not in ('today','week','all') or p_offset not between 0 and 10000 then raise exception 'Invalid leaderboard page.'; end if;
 -- Only opted-in players with a chosen name. Google is optional.
 with aggregate_scores as (
  select p.id,p.username,count(*) as completed,sum(a.score) as points,sum(a.elapsed_seconds) as elapsed,min(a.completed_at) as first_completed
  from public.players p join auth.users au on au.id=p.id join public.daily_attempts a on a.player_id=p.id join public.daily_cases c on c.id=a.case_id
  where p.public_profile_enabled and p.username_chosen and a.status<>'active' and c.case_date <= (now() at time zone 'UTC')::date and (p_scope='all' or (p_scope='today' and c.case_date=(now() at time zone 'UTC')::date) or (p_scope='week' and c.case_date>=date_trunc('week',now() at time zone 'UTC')::date))
  group by p.id,p.username
 ), ranked as(select *,rank() over(order by points desc) as position from aggregate_scores),
 paged as(select * from ranked order by position,username,id limit 25 offset p_offset)
 select jsonb_build_object('rows',coalesce((select jsonb_agg(jsonb_build_object('position',position,'username',username,'score',points,'elapsed_seconds',elapsed,'completed',completed,'career_completed',(private.summary(id)->>'total')::integer,'current_streak',(private.summary(id)->>'current')::integer) order by position,username,id) from paged),'[]'::jsonb),'mine',(select jsonb_build_object('position',position,'username',username,'score',points,'elapsed_seconds',elapsed,'completed',completed,'career_completed',(private.summary(id)->>'total')::integer,'current_streak',(private.summary(id)->>'current')::integer) from ranked where id=u),'total',(select count(*) from ranked)) into data;
 return data;
end $$;
revoke all on function public.outbreak_leaderboard(text,integer) from public,anon;
grant execute on function public.outbreak_leaderboard(text,integer) to authenticated;

commit;
