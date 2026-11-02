-- Separate optional phylogenetic evidence. No attempts or existing prices change.
insert into private.evidence_catalog(id,cost) values ('phylogeny',16)
on conflict (id) do nothing;

-- The seven clues total 80 points; preserve all existing attempt values.
alter table public.daily_attempts drop constraint daily_attempts_evidence_cost_check;
alter table public.daily_attempts add constraint daily_attempts_evidence_cost_check check (evidence_cost between 0 and 80);

-- Retain existing reports verbatim and backfill only the missing tree report.
update private.case_secrets
set reports=reports || jsonb_build_object('phylogeny',jsonb_build_object(
 'title','Phylogenetic tree · reported sample lineages',
 'rows',reports->'genomics'->'rows',
 'note','Unresolved lineage grouping; branches do not establish direct transmission or its direction.'))
where not (reports ? 'phylogeny') and jsonb_typeof(reports->'genomics'->'rows')='array';

update private.practice_cases
set reports=reports || jsonb_build_object('phylogeny',jsonb_build_object(
 'title','Phylogenetic tree · reported sample lineages',
 'rows',reports->'genomics'->'rows',
 'note','Unresolved lineage grouping; branches do not establish direct transmission or its direction.'))
where not (reports ? 'phylogeny') and jsonb_typeof(reports->'genomics'->'rows')='array';
