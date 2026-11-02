// Owner tooling only: never import into the browser application.
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

function date(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T00:00:00Z'))||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)throw Error('Expected a real YYYY-MM-DD UTC date');
 return value;
}
export function scheduleSQL(start=new Date().toISOString().slice(0,10),days=14){
 date(start);
 if(!Number.isInteger(days)||days<1||days>366)throw Error('Window must be 1–366 days');
 return `-- Owner-only, read-only schedule metadata. No story or answer values are returned.
with calendar as (
 select date '${start}' + n as day from generate_series(0, ${days-1}) n
), checks as (
 select day,
 c.id is not null as scheduled,
 coalesce(c.published_at <= (day::timestamp at time zone 'UTC'), false) as releases_on_time,
 coalesce(s.reports ?& array['bookings','windows','interviews','contacts','outside','genomics','phylogeny']
 and not exists (select 1 from unnest(array['bookings','windows','interviews','contacts','outside','genomics','phylogeny']) k
 where jsonb_typeof(s.reports->k) is distinct from 'object' or s.reports->k = '{}'::jsonb), false) as reports_present,
 coalesce(jsonb_typeof(s.solution) = 'object' and s.solution <> '{}'::jsonb, false) as solution_present
 from calendar left join public.daily_cases c on c.case_date = day
 left join private.case_secrets s on s.case_id = c.id
)
select jsonb_build_object('start', '${start}', 'days', ${days}, 'dates',
 jsonb_agg(jsonb_build_object('date',day,'scheduled',scheduled,'releases_on_time',releases_on_time,
 'reports_present',reports_present,'solution_present',solution_present) order by day)) as schedule_health
from checks;\n`;
}
export function summarize(snapshot){
 date(snapshot.start);
 if(!Number.isInteger(snapshot.days)||snapshot.days<1||snapshot.days>366||!Array.isArray(snapshot.dates)||snapshot.dates.length!==snapshot.days)throw Error('Invalid schedule snapshot');
 const issues=[];let consecutive=0,open=true,ready=0;
 snapshot.dates.forEach((row,i)=>{
  const expected=new Date(Date.parse(snapshot.start+'T00:00:00Z')+i*86400000).toISOString().slice(0,10);
  if(row.date!==expected||!['scheduled','releases_on_time','reports_present','solution_present'].every(k=>typeof row[k]==='boolean'))throw Error('Invalid schedule snapshot');
  const reasons=!row.scheduled?['missing case']:['releases_on_time','reports_present','solution_present'].filter(k=>!row[k]).map(k=>({releases_on_time:'late release',reports_present:'missing reports',solution_present:'missing solution'})[k]);
  if(reasons.length){open=false;issues.push({date:row.date,reasons});}else{ready++;if(open)consecutive++;}
 });
 return {start:snapshot.start,days:snapshot.days,ready,consecutive,issues};
}
export function main(args){
 if(args[0]==='sql'&&args.length<=3){process.stdout.write(scheduleSQL(args[1],args[2]===undefined?14:Number(args[2])));return;}
 if(args[0]==='check'&&args.length===2){
  const result=summarize(JSON.parse(readFileSync(args[1]==='-'?0:args[1],'utf8')));
  console.log(`UTC schedule from ${result.start}: ${result.ready}/${result.days} ready; ${result.consecutive} consecutive ready days (including start).`);
  for(const issue of result.issues)console.log(`${issue.date}: ${issue.reasons.join(', ')}`);
  process.exitCode=result.issues.length?1:0;return;
 }
 throw Error('Usage: schedule-health.mjs sql [YYYY-MM-DD] [days] | check <snapshot.json|->');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{main(process.argv.slice(2));}catch{console.error('Schedule check failed. Use sql [YYYY-MM-DD] [days] or check <snapshot.json|->; verify arguments and snapshot format.');process.exitCode=2;}
}
