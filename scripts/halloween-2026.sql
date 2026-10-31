-- Date-specific editorial patch requested by the site owner.
-- No answer key is embedded. Unchanged numeric onset/contact dates, names, tree and source.
-- Refuses to change a case once an official attempt exists, including after publication.
begin;
do $halloween$
declare
 c public.daily_cases%rowtype;
 s private.case_secrets%rowtype;
 new_public jsonb;
 new_reports jsonb;
 new_solution jsonb;
 interview_texts jsonb := '["I sell ceramic skulls. Ben and I worked at the same packing table on October 18, preparing the Halloween preview stock. My symptoms began October 21. Bret helped me pack unsold stock in the workroom on October 22. The skulls were recalled because their paint ran, which is a separate and humiliating problem.","Bob and I packed stock together in the workroom on October 22. My symptoms began October 24. My volunteer badge says LORD OF THE QUEUE. It does not come with sick pay.","Ben and I worked together in the shared workroom on October 18, preparing posters for the Halloween previews. Symptoms began October 20. Joicy and I sorted signage there on October 21. The notice saying DO NOT ENTER was apparently too subtle for the committee.","Luke and I sorted signage in the workroom on October 21. My symptoms began October 23. I spent the rest of the week explaining that the inspection failure was real and the blood on the walls was paint. My incident form asks whether the panic was planned.","I attended an exhibition in another city on October 14. My symptoms began October 17. I worked with Bob and Luke in the shared workroom on October 18, preparing Halloween stock and posters. I thought the sore throat was from pitching my stall all weekend.","I returned from separate travel before my symptoms began October 16. I have no documented encounter with the other five patients before their symptom onsets. My delivery paperwork became part of the investigation because the market office filed every document under SUSPICIOUS."]'::jsonb;
 before_attempts text;
 after_attempts text;
begin
 select * into strict c from public.daily_cases where case_date='2026-10-31' for update;
 select * into strict s from private.case_secrets where case_id=c.id for update;
 if c.public_data->>'title'='The Haunting at North Quay' then return; end if;
 if exists(select 1 from public.daily_attempts where case_id=c.id) then raise exception 'Case already has attempts; do not change it'; end if;
 if md5(c.public_data::text)<>'7c9d90cb698eb7180244a130385e881f' or md5(s.reports::text)<>'523044ebb4349462a12121241e891cb3' or md5(s.solution::text)<>'a4cc00596234040d91fc2222666e3f19' then raise exception 'Source case changed; review before applying'; end if;
 select md5(coalesce(jsonb_agg(to_jsonb(a) order by a.id)::text,'')) into before_attempts from public.daily_attempts a;
 new_public := c.public_data || jsonb_build_object('title','The Haunting at North Quay','place','NORTH QUAY HALLOWEEN MARKET','month','October','brief','Tonight’s Halloween market is sold out. Unfortunately, six people from its preview events are ill, the haunted walkthrough has failed inspection, and someone has submitted “the building is cursed” as a root-cause analysis. Darren, handling publicity, wants to call the outbreak “seasonal atmosphere.” The lab has identified a fictional respiratory virus. Trace the connected five-person cluster through the October records; one infection belongs to a separate chain. Costumes, gossip, and Darren’s statement are background flavor, not exposure evidence.');
 new_reports := replace(replace(s.reports::text,'November','October'),'Nov ','Oct ')::jsonb;
 new_solution := replace(s.solution::text,'November','October')::jsonb;
 new_reports := jsonb_set(new_reports,'{interviews,interviews}',interview_texts);
 new_reports := jsonb_set(new_reports,'{interviews,rows}',(
 select jsonb_agg(row || jsonb_build_object('text',interview_texts->((ord-1)::int)) order by ord)
 from jsonb_array_elements(new_reports#>'{interviews,rows}') with ordinality as r(row,ord)));
 new_reports := jsonb_set(new_reports,'{bookings,rows}',(
 select jsonb_agg(row || jsonb_build_object('text',case ord
 when 1 then 'Shared workroom · Halloween stock and poster preparation · booking for 3 people.'
 when 2 then 'Shared workroom · Halloween signage sorting · booking for 2 people.'
 else 'Shared workroom · packing unsold Halloween stock · booking for 2 people.' end) order by ord)
 from jsonb_array_elements(new_reports#>'{bookings,rows}') with ordinality as r(row,ord)));
 if new_solution-'explanation' is distinct from s.solution-'explanation' then raise exception 'Answer structure changed'; end if;
 if new_reports#>'{contacts,contacts}' is distinct from s.reports#>'{contacts,contacts}' then raise exception 'Contact dates changed'; end if;
 if new_public->'patients' is distinct from c.public_data->'patients' then raise exception 'Patient records changed'; end if;
 if jsonb_array_length(new_reports#>'{interviews,rows}')<>6 or jsonb_array_length(new_reports#>'{interviews,interviews}')<>6 then raise exception 'Missing interviews'; end if;
 if new_reports::text like '%November%' or new_reports::text like '%Nov %' or new_solution::text like '%November%' then raise exception 'Inconsistent month labels'; end if;
 update public.daily_cases set public_data=new_public where id=c.id;
 update private.case_secrets set reports=new_reports,solution=new_solution where case_id=c.id;
 select md5(coalesce(jsonb_agg(to_jsonb(a) order by a.id)::text,'')) into after_attempts from public.daily_attempts a;
 if before_attempts is distinct from after_attempts then raise exception 'Attempts changed'; end if;
end $halloween$;
commit;
