-- Private leagues v1. Extends the reserved group tables; no score copies or daily-rule changes.
begin;
alter table private.friend_groups add column created_at timestamptz not null default clock_timestamp(),
 add column invite_hash text, add column invite_expires_at timestamptz;
alter table private.friend_groups add constraint friend_group_name check(char_length(btrim(name)) between 3 and 40 and name !~ '[[:cntrl:]]'),
 add constraint friend_invite_pair check((invite_hash is null)=(invite_expires_at is null));
create unique index friend_invite_hash on private.friend_groups(invite_hash) where invite_hash is not null;
alter table private.friend_members add column joined_at timestamptz not null default clock_timestamp();
create index friend_members_player on private.friend_members(player_id,group_id);
insert into private.friend_members(group_id,player_id) select id,owner_id from private.friend_groups on conflict do nothing;
create table private.league_request_limits(player_id uuid not null references auth.users(id) on delete cascade,
 action text not null,bucket timestamptz not null,n integer not null,primary key(player_id,action,bucket));
alter table private.friend_groups enable row level security;
alter table private.friend_members enable row level security;
alter table private.league_request_limits enable row level security;
revoke all on private.friend_groups,private.friend_members,private.league_request_limits from public,anon,authenticated;

-- Membership uses verified server-side Google identities, never user-editable JWT metadata.
create function private.league_user() returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid;
begin
 u:=private.guard();
 if not exists(select 1 from auth.users a join auth.identities i on i.user_id=a.id
  where a.id=u and not coalesce(a.is_anonymous,false) and i.provider='google') then
  raise exception 'Link Google to use private friend leagues. Guest daily play is unchanged.' using errcode='42501';
 end if;
 return u;
end $$;
create function private.league_rate(u uuid,op text,max_n integer) returns boolean language plpgsql security definer set search_path='' as $$
declare n_used integer;
begin
 insert into private.league_request_limits values(u,op,date_trunc('hour',clock_timestamp()),1)
 on conflict(player_id,action,bucket) do update set n=private.league_request_limits.n+1 returning n into n_used;
 delete from private.league_request_limits where bucket<clock_timestamp()-interval '2 days';
 return n_used<=max_n;
end $$;
create function private.league_period(scope text,today date) returns table(start_date date,end_date date)
language sql immutable set search_path='' as $$
 select case when scope='week' then date_trunc('week',today::timestamp)::date else today end,
 case when scope='week' then date_trunc('week',today::timestamp)::date+6 else today end
$$;
revoke all on function private.league_user(),private.league_rate(uuid,text,integer),private.league_period(text,date) from public,anon,authenticated;

create function public.outbreak_leagues() returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=private.league_user();
begin
 return coalesce((select jsonb_agg(jsonb_build_object('id',g.id,'name',g.name,'is_owner',g.owner_id=u,
 'members',(select count(*) from private.friend_members x where x.group_id=g.id)) order by g.created_at,g.id)
 from private.friend_groups g join private.friend_members m on m.group_id=g.id and m.player_id=u),'[]'::jsonb);
end $$;
create function public.outbreak_league_manage(p_action text,p_group uuid default null,p_name text default null,p_member uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=private.league_user();g private.friend_groups;new_id uuid;
begin
 -- Serialize each player's creation/join cap, then lock the group for membership/owner mutations.
 if p_action='create' then
  perform pg_advisory_xact_lock(hashtextextended(u::text,713));
  if not private.league_rate(u,'create',5) then return jsonb_build_object('ok',false,'error','League creation limit reached. Try again next hour.'); end if;
  if p_name is null or char_length(btrim(p_name)) not between 3 and 40 or p_name ~ '[[:cntrl:]]' then raise exception 'Use a league name of 3–40 characters, without control characters.'; end if;
  if (select count(*) from private.friend_groups where owner_id=u)>=5 then raise exception 'You can own up to five leagues.'; end if;
  if (select count(*) from private.friend_members where player_id=u)>=20 then raise exception 'You can belong to up to twenty leagues.'; end if;
  insert into private.friend_groups(owner_id,name) values(u,btrim(p_name)) returning id into new_id;
  insert into private.friend_members(group_id,player_id) values(new_id,u);
  return jsonb_build_object('ok',true,'id',new_id);
 end if;
 select * into g from private.friend_groups where id=p_group for update;
 if g.id is null or not exists(select 1 from private.friend_members where group_id=g.id and player_id=u) then raise exception 'League unavailable.' using errcode='42501'; end if;
 if p_action='leave' then
  if g.owner_id=u then raise exception 'Owners must delete their league to leave. Ownership transfer is not available yet.'; end if;
  delete from private.friend_members where group_id=g.id and player_id=u;
 elsif p_action='remove' then
  if g.owner_id<>u then raise exception 'Only the league owner can remove members.' using errcode='42501'; end if;
  if p_member is null or p_member=u then raise exception 'Owners must delete their league to leave.'; end if;
  delete from private.friend_members where group_id=g.id and player_id=p_member;
 elsif p_action='delete' then
  if g.owner_id<>u then raise exception 'Only the league owner can delete it.' using errcode='42501'; end if;
  delete from private.friend_groups where id=g.id;
 else raise exception 'Unknown league action.';
 end if;
 return jsonb_build_object('ok',true);
end $$;
create function public.outbreak_league_invite(p_group uuid,p_action text default 'generate') returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=private.league_user();g private.friend_groups;t text;expires timestamptz;
begin
 select * into g from private.friend_groups where id=p_group for update;
 if g.id is null or g.owner_id<>u then raise exception 'Only the league owner can manage invitations.' using errcode='42501'; end if;
 if not private.league_rate(u,'invite',20) then return jsonb_build_object('ok',false,'error','Invitation limit reached. Try again next hour.'); end if;
 if p_action='revoke' then
  update private.friend_groups set invite_hash=null,invite_expires_at=null where id=g.id;
  return jsonb_build_object('ok',true);
 elsif p_action is distinct from 'generate' then raise exception 'Unknown invitation action.'; end if;
 -- Two cryptographically random UUIDv4 values give 244 random bits. Only SHA-256 is stored.
 t:=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');expires:=clock_timestamp()+interval '7 days';
 update private.friend_groups set invite_hash=encode(sha256(convert_to(t,'UTF8')),'hex'),invite_expires_at=expires where id=g.id;
 return jsonb_build_object('ok',true,'token',t,'expires_at',expires);
end $$;
-- Public preview is intentionally minimal: no member lists, results, owner or identity data.
create function public.outbreak_league_preview(p_token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare g private.friend_groups;
begin
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then return jsonb_build_object('status','unavailable'); end if;
 select * into g from private.friend_groups where invite_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex');
 if g.id is null then return jsonb_build_object('status','unavailable'); end if;
 if g.invite_expires_at<=clock_timestamp() then return jsonb_build_object('status','expired'); end if;
 return jsonb_build_object('status','available','name',g.name);
end $$;
create function public.outbreak_league_join(p_token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=private.league_user();g private.friend_groups;
begin
 perform pg_advisory_xact_lock(hashtextextended(u::text,713));
 -- Return errors (rather than rolling back) so invalid redemption attempts consume the limit.
 if not private.league_rate(u,'join',20) then return jsonb_build_object('ok',false,'error','Too many invitation attempts. Try again next hour.'); end if;
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then return jsonb_build_object('ok',false,'error','Invitation unavailable. Ask the owner for a fresh link.'); end if;
 select * into g from private.friend_groups where invite_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') for update;
 if g.id is null or g.invite_expires_at<=clock_timestamp() then return jsonb_build_object('ok',false,'error','Invitation expired, revoked, or league deleted. Ask the owner for a fresh link.'); end if;
 if exists(select 1 from private.friend_members where group_id=g.id and player_id=u) then return jsonb_build_object('ok',true,'id',g.id,'already_member',true); end if;
 if (select count(*) from private.friend_members where player_id=u)>=20 then return jsonb_build_object('ok',false,'error','You can belong to up to twenty leagues.'); end if;
 if (select count(*) from private.friend_members where group_id=g.id)>=50 then return jsonb_build_object('ok',false,'error','This league has reached its fifty-member limit.'); end if;
 insert into private.friend_members(group_id,player_id) values(g.id,u) on conflict do nothing;
 return jsonb_build_object('ok',true,'id',g.id,'already_member',false);
end $$;
create function public.outbreak_league_standings(p_group uuid,p_scope text default 'today') returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=private.league_user();g private.friend_groups;v_today date:=(clock_timestamp() at time zone 'UTC')::date;
 first_day date;last_day date;cutoff date;unlocked boolean;expired record;rows jsonb;roster jsonb;
begin
 if p_scope not in ('today','week') or p_scope is null then raise exception 'Choose today or week.'; end if;
 select * into g from private.friend_groups where id=p_group for share;
 if g.id is null or not exists(select 1 from private.friend_members where group_id=g.id and player_id=u) then raise exception 'League unavailable. You may have left or been removed.' using errcode='42501'; end if;
 -- Finalize only the viewer's naturally expired attempt, using the existing authoritative rules.
 for expired in select id from public.daily_attempts where player_id=u and status='active' loop perform private.expire_one(expired.id); end loop;
 unlocked:=exists(select 1 from public.daily_attempts a join public.daily_cases c on c.id=a.case_id where a.player_id=u and c.case_date=v_today and a.status<>'active');
 select start_date,end_date into first_day,last_day from private.league_period(p_scope,v_today);
 cutoff:=case when unlocked then v_today else v_today-1 end;
 select jsonb_agg(jsonb_build_object('player_id',m.player_id,'display_name',p.username,'is_me',m.player_id=u,'is_owner',m.player_id=g.owner_id,
 'join_date',(m.joined_at at time zone 'UTC')::date) order by lower(p.username),m.player_id) into roster
 from private.friend_members m join public.players p on p.id=m.player_id where m.group_id=g.id;
 with totals as (
  select m.player_id,p.username,
   coalesce(sum(a.score) filter(where a.status<>'active'),0)::integer as points,
   count(*) filter(where a.status<>'active' and a.correct_solution)::integer as solved,
   count(*) filter(where a.status<>'active') as completed,
   case when count(*) filter(where a.status<>'active')>0 then 'finished'
    when count(a.id)>0 then 'investigating' else 'not_started' end as participation
  from private.friend_members m join public.players p on p.id=m.player_id
  left join public.daily_cases c on c.case_date between first_day and last_day and c.case_date>=(m.joined_at at time zone 'UTC')::date
   and c.case_date<=case when p_scope='week' then cutoff else v_today end and c.published_at<=clock_timestamp()
  left join public.daily_attempts a on a.case_id=c.id and a.player_id=m.player_id
  where m.group_id=g.id group by m.player_id,p.username
 ), ranked as (
  select *,case when p_scope='week' or completed>0 then rank() over(order by case when p_scope='today' and completed=0 then null else points end desc nulls last) end as position from totals
 ) select coalesce(jsonb_agg(jsonb_build_object('player_id',player_id,'display_name',username,'is_me',player_id=u,
  'points',case when p_scope='today' and (not unlocked or completed=0) then null else points end,
  'solved',case when p_scope='today' and (not unlocked or completed=0) then null else solved end,
  'rank',case when p_scope='today' and (not unlocked or completed=0) then null else position end,
  'status',case when p_scope='week' then 'weekly' else participation end)
  order by case when p_scope='today' and not unlocked then null else position end nulls last,lower(username),player_id),'[]'::jsonb) into rows from ranked;
 return jsonb_build_object('id',g.id,'name',g.name,'is_owner',g.owner_id=u,'scope',p_scope,'start_date',first_day,'end_date',last_day,
 'today',v_today,'today_unlocked',unlocked,'counted_through',cutoff,'rows',rows,'members',roster,
 'invite_expires_at',case when g.owner_id=u then g.invite_expires_at else null end);
end $$;
revoke all on function public.outbreak_leagues(),public.outbreak_league_manage(text,uuid,text,uuid),public.outbreak_league_invite(uuid,text),
 public.outbreak_league_preview(text),public.outbreak_league_join(text),public.outbreak_league_standings(uuid,text) from public,anon,authenticated;
grant execute on function public.outbreak_league_preview(text) to anon,authenticated;
grant execute on function public.outbreak_leagues(),public.outbreak_league_manage(text,uuid,text,uuid),public.outbreak_league_invite(uuid,text),
 public.outbreak_league_join(text),public.outbreak_league_standings(uuid,text) to authenticated;
commit;
