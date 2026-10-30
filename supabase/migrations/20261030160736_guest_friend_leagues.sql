-- Allow browser-backed anonymous players to use private leagues.
-- SQL anon (no player session) keeps preview-only access. Google is optional.
begin;
create or replace function private.league_user() returns uuid
language plpgsql security definer set search_path='' as $$
begin
 return private.guard();
end $$;
revoke all on function private.league_user() from public,anon,authenticated;
commit;
