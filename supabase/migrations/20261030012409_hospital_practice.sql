-- Curated practice only. Never grants access to unmarked future daily cases.
-- Returns the same fixture shape as archive replay; no daily attempt is written.
begin;
create or replace function public.outbreak_practice(p_slug text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid; c public.daily_cases; s private.case_secrets;
begin
 u:=private.guard();
 select * into c from public.daily_cases
 where public_data->>'id'=p_slug and public_data->>'practice_available'='true'
 order by case_date desc limit 1;
 if c.id is null then raise exception 'Sample practice unavailable.'; end if;
 select * into s from private.case_secrets where case_id=c.id;
 if s.case_id is null then raise exception 'Sample evidence unavailable.'; end if;
 return jsonb_build_object('case_id',c.id,'case_date',c.case_date,'number','LAB-01',
 'case',c.public_data,'server_now',clock_timestamp(),'attempt',null,'reports',s.reports,'solution',s.solution);
end $$;
revoke all on function public.outbreak_practice(text) from public,anon;
grant execute on function public.outbreak_practice(text) to authenticated;
comment on function public.outbreak_practice(text) is 'Authenticated access to explicitly previewable fictional samples only. Practice does not write daily attempts or scores.';
commit;
