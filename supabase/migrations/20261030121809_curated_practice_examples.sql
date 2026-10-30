-- Curated practice lives separately from daily scheduling and competitive attempts.
create table private.practice_cases(
 slug text primary key,
 number text not null unique,
 public_data jsonb not null,
 solution jsonb not null,
 reports jsonb not null,
 check(public_data->>'id'=slug)
);
alter table private.practice_cases enable row level security;
revoke all on private.practice_cases from public,anon,authenticated;
create or replace function public.outbreak_practice(p_slug text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid; p private.practice_cases; c public.daily_cases; s private.case_secrets;
begin
 u:=private.guard();
 select * into p from private.practice_cases where slug=p_slug;
 if p.slug is not null then
  return jsonb_build_object('case_id',p.slug,'case_date',(clock_timestamp() at time zone 'UTC')::date,'number',p.number,
   'case',p.public_data,'server_now',clock_timestamp(),'attempt',null,'reports',p.reports,'solution',p.solution);
 end if;
 -- Retain the explicitly marked older hospital fixture; unmarked daily cases stay sealed.
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
