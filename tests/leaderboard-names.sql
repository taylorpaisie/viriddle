-- Run only in an empty, disposable PostgreSQL database with psql -v ON_ERROR_STOP=1.
create role anon;
create role authenticated;
create schema auth;
create table auth.users(id uuid primary key,is_anonymous boolean default false);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema auth to authenticated,anon;
\ir ../supabase/migrations/202610290001_outbreak.sql
insert into auth.users values ('00000000-0000-4000-8000-000000000001',true),('00000000-0000-4000-8000-000000000002',false);
insert into public.players(id,username,public_profile_enabled) values ('00000000-0000-4000-8000-000000000001','Investigator-1234abcd',true),('00000000-0000-4000-8000-000000000002','Existing_Name',true);
insert into public.daily_cases(id,case_date,published_at,public_data) values ('00000000-0000-4000-8000-000000000003',current_date,now(),'{}');
insert into public.daily_attempts(player_id,case_id,completed_at,elapsed_seconds,score,correct_solution,status) select id,'00000000-0000-4000-8000-000000000003',now(),10,90,true,'completed' from public.players;
\ir ../supabase/leaderboard-names.sql
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false);
set role authenticated;
do $$
declare result jsonb; n text;
begin
 result:=public.outbreak_profile();
 assert (result->'stats'->>'total')::int=1;
 assert not (result->'player'->>'username_chosen')::boolean;
 assert not (result->'player'->>'public_profile_enabled')::boolean;
 assert (public.outbreak_leaderboard()->>'total')::int=1;
 begin
  perform public.outbreak_save_profile(null,true);
  raise exception 'TEST: unnamed opt-in accepted';
 exception when others then if sqlerrm like 'TEST:%' then raise; end if; end;
 foreach n in array array['ab','                     ','___','TwentyOneCharactersXX','Admin','a_d-m i n','Investigator-deadbeef','f_u_c_k'] loop
  begin
   perform public.outbreak_save_profile(n,true);
   raise exception 'TEST: invalid name accepted: %',n;
  exception when others then if sqlerrm like 'TEST:%' then raise; end if; end;
 end loop;
 begin
  perform public.outbreak_save_profile('existing_name',true);
  raise exception 'TEST: duplicate name accepted';
 exception when others then assert sqlerrm='That name is taken. Please choose another.'; end;
 perform public.outbreak_save_profile('  Detective One  ',false);
 assert (public.outbreak_leaderboard()->>'total')::int=1;
 perform public.outbreak_save_profile(null,true);
 result:=public.outbreak_leaderboard();
 assert (result->>'total')::int=2;
 assert result->'mine'->>'username'='Detective One';
 assert (result->'mine'->>'score')::int=90;
 perform public.outbreak_save_profile(null,false,true);
 assert (public.outbreak_leaderboard()->>'total')::int=1;
 assert (public.outbreak_profile()->'stats'->>'total')::int=1;
 begin
  update public.players set username='Bypass' where id=auth.uid();
  raise exception 'TEST: direct update allowed';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
set role anon;
do $$ begin
 begin
  perform public.outbreak_save_profile('Bypass',true);
  raise exception 'TEST: unauthenticated save allowed';
 exception when insufficient_privilege then null; end;
end $$;
\echo PASS: chosen names, validation, uniqueness, guest opt-in, private saved scores, legacy names and RPC permissions.
