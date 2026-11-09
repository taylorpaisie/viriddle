// Owner-only quality checks. Never import into the browser or print answer positions.
import assert from 'node:assert/strict';

export function answerPattern({date,case:c,solution:s}){
 if(s.outcome==='unresolved')return {date,onset:null,roster:null};
 assert.ok(Number.isInteger(s.source)&&c.patients[s.source],'Valid source required');
 const onset=c.patients[s.source].onset;
 const earlier=c.patients.filter(p=>p.onset<onset).length;
 const tied=c.patients.filter(p=>p.onset===onset).length;
 return {date,onset:`${earlier+1}:${tied}`,roster:String(s.source)};
}

export function assertAnswerVariety(entries){
 const rows=entries.map(answerPattern).sort((a,b)=>a.date.localeCompare(b.date));
 assert.equal(new Set(rows.map(r=>r.date)).size,rows.length,'Duplicate variety-check date');
 for(let i=0;i<rows.length;i++)for(const field of ['onset','roster']){
  const key=rows[i][field];if(key===null)continue;
  // Stop four consecutive repeats and a single shortcut winning six of seven cases.
  const last4=rows.slice(Math.max(0,i-3),i+1),last7=rows.slice(Math.max(0,i-6),i+1);
  assert.ok(!(last4.length===4&&last4.every(r=>r[field]===key)),`Answer variety: repeated ${field} pattern; revise the cases before scheduling.`);
  assert.ok(!(last7.length===7&&last7.filter(r=>r[field]===key).length>=6),`Answer variety: dominant ${field} pattern; revise the cases before scheduling.`);
 }
}

// Runs after inserts inside the scheduling transaction, so small packs cannot bypass
// the check at their boundary with the existing bank. Past cases are grandfathered.
// Values and positions stay in private SQL, never in exceptions or public responses.
export function answerVarietySQL(){return `do $variety$
begin
 if exists (
  with patterns as (
   select c.case_date,
    case when coalesce(s.solution->>'outcome','') <> 'unresolved' then s.solution->>'source' end as roster,
    case when coalesce(s.solution->>'outcome','') <> 'unresolved' then
     (select count(*) from jsonb_array_elements(c.public_data->'patients') p where (p->>'onset')::int < (c.public_data->'patients'->((s.solution->>'source')::int)->>'onset')::int)::text || ':' ||
     (select count(*) from jsonb_array_elements(c.public_data->'patients') p where (p->>'onset')::int = (c.public_data->'patients'->((s.solution->>'source')::int)->>'onset')::int)::text
    end as onset
   from public.daily_cases c join private.case_secrets s on s.case_id=c.id
  ), windows as (
   select case_date,roster,onset,
    array_agg(roster) over (order by case_date rows between 3 preceding and current row) as roster4,
    array_agg(onset) over (order by case_date rows between 3 preceding and current row) as onset4,
    array_agg(roster) over (order by case_date rows between 6 preceding and current row) as roster7,
    array_agg(onset) over (order by case_date rows between 6 preceding and current row) as onset7
   from patterns
  )
  select 1 from windows w where case_date > (clock_timestamp() at time zone 'UTC')::date and (
   (roster is not null and ((cardinality(roster4)=4 and (select count(*) from unnest(roster4) x where x=w.roster)=4) or (cardinality(roster7)=7 and (select count(*) from unnest(roster7) x where x=w.roster)>=6))) or
   (onset is not null and ((cardinality(onset4)=4 and (select count(*) from unnest(onset4) x where x=w.onset)=4) or (cardinality(onset7)=7 and (select count(*) from unnest(onset7) x where x=w.onset)>=6)))
  )
 ) then raise exception 'Answer variety check failed; revise unreleased cases before scheduling.';end if;
end $variety$;\n`;}
