-- Owner-run content patch: one practice case only; no daily cases or attempts.
-- Kept separate from the full fixture seed to preserve all other live content.
begin;
do $$
declare p private.practice_cases; updated private.practice_cases;
begin
 select * into p from private.practice_cases where slug='duck-press' for update;
 if not found then raise exception 'Expected practice case is missing'; end if;
 if p.public_data->'patients'->2->>'name'='Anya' then
  if (p.public_data::text || p.solution::text || p.reports::text) ~ '\mLucy\M' then
   raise exception 'Anya case has inconsistent old name references';
  end if;
  return;
 end if;
 if jsonb_array_length(p.public_data->'patients')<>3
  or p.public_data->'patients'->0->>'name'<>'Darren'
  or p.public_data->'patients'->1->>'name'<>'Carla'
  or p.public_data->'patients'->2->>'name'<>'Lucy'
  or (p.public_data::text || p.solution::text || p.reports::text) ~ '\mAnya\M'
 then raise exception 'Unexpected practice roster; review before changing'; end if;
 update private.practice_cases set
  public_data=regexp_replace(p.public_data::text,'\mLucy\M','Anya','g')::jsonb,
  solution=regexp_replace(p.solution::text,'\mLucy\M','Anya','g')::jsonb,
  reports=regexp_replace(p.reports::text,'\mLucy\M','Anya','g')::jsonb
 where slug=p.slug returning * into updated;
 -- Reversing the substitution must recover the exact original JSON values.
 if regexp_replace(updated.public_data::text,'\mAnya\M','Lucy','g')::jsonb<>p.public_data
  or regexp_replace(updated.solution::text,'\mAnya\M','Lucy','g')::jsonb<>p.solution
  or regexp_replace(updated.reports::text,'\mAnya\M','Lucy','g')::jsonb<>p.reports
 then raise exception 'Practice content changed beyond the intended name'; end if;
end $$;
commit;
