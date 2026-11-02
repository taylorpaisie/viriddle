-- Public scores only; equal point totals share a competition rank.
create or replace function public.outbreak_leaderboard(p_scope text default 'today',p_offset integer default 0) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; data jsonb;
begin
 u:=private.guard();
 if p_scope not in ('today','week','all') or p_offset not between 0 and 10000 then raise exception 'Invalid leaderboard page.'; end if;
 -- Only explicitly opted-in, permanent accounts. No emails, real names, avatars or auth metadata.
 with aggregate_scores as (
  select p.id,p.username,count(*) as completed,sum(a.score) as points,sum(a.elapsed_seconds) as elapsed,min(a.completed_at) as first_completed
  from public.players p join auth.users au on au.id=p.id join public.daily_attempts a on a.player_id=p.id join public.daily_cases c on c.id=a.case_id
  where p.public_profile_enabled and not coalesce(au.is_anonymous,false) and a.status<>'active' and c.case_date <= (now() at time zone 'UTC')::date and (p_scope='all' or (p_scope='today' and c.case_date=(now() at time zone 'UTC')::date) or (p_scope='week' and c.case_date>=date_trunc('week',now() at time zone 'UTC')::date))
  group by p.id,p.username
 ), ranked as(select *,rank() over(order by points desc) as position from aggregate_scores),
 paged as(select * from ranked order by position,username,id limit 25 offset p_offset)
 select jsonb_build_object('rows',coalesce((select jsonb_agg(jsonb_build_object('position',position,'username',username,'score',points,'elapsed_seconds',elapsed,'completed',completed,'career_completed',(private.summary(id)->>'total')::integer,'current_streak',(private.summary(id)->>'current')::integer) order by position,username,id) from paged),'[]'::jsonb),'mine',(select jsonb_build_object('position',position,'username',username,'score',points,'elapsed_seconds',elapsed,'completed',completed,'career_completed',(private.summary(id)->>'total')::integer,'current_streak',(private.summary(id)->>'current')::integer) from ranked where id=u),'total',(select count(*) from ranked)) into data;
 return data;
end $$;
revoke all on function public.outbreak_leaderboard(text,integer) from public,anon;
grant execute on function public.outbreak_leaderboard(text,integer) to authenticated;
