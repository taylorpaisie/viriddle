// Owner-only tooling. Never import private packs into src/, public/, or a Vite build.
import assert from 'node:assert/strict';
import {assertAnswerVariety,answerVarietySQL} from './answer-variety.mjs';
import {storyMonthDays,incubationWindow} from './case-dates.mjs';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

const categories=['bookings','windows','interviews','contacts','outside','genomics'];
const isoDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
const text=x=>typeof x==='string'&&x.trim().length>0;
export function validatePack(pack){
 assert.equal(pack.version,1);assert.ok(Array.isArray(pack.cases)&&pack.cases.length>0&&pack.cases.length<=366);
 const dates=new Set(),ids=new Set(),summaries=[];
 for(const entry of pack.cases){
  const {date,case:c,reports:r,solution:s,audit:a}=entry;
  assert.ok(isoDate(date),'Real ISO release date required');assert.ok(!dates.has(date),'Duplicate release date');dates.add(date);
  assert.ok(text(c.id)&&!ids.has(c.id),'Distinct case IDs required');ids.add(c.id);
  for(const field of ['title','place','brief','pathogen','incubation','infectiousness'])assert.ok(text(c[field]),field);
  const monthDays=storyMonthDays(c.month);
  assert.deepEqual(c.incubationDays,[1,4]);assert.equal(c.practice_available,false,'Fresh daily cases cannot be practice previews');
  assert.equal(c.patients.length,6);assert.equal(new Set(c.patients.map(p=>p.name)).size,6);
  if(date>='2026-11-14')assert.equal(c.patients.filter(p=>p.name==='Darren').length,1,'New daily cases must include Darren exactly once');
  assert.ok(c.patients.every(p=>text(p.name)&&text(p.role)&&Number.isInteger(p.onset)&&p.onset>=1&&p.onset<=monthDays&&p.interview===''&&Object.keys(p).every(k=>['name','role','onset','interview'].includes(k))));
  assert.deepEqual(c.contacts,[]);assert.deepEqual(c.genomics,[]);
  const publicKeys=['id','title','place','month','brief','pathogen','incubation','incubationDays','infectiousness','patients','contacts','genomics','interviewNote','objective','practice_available'];
  assert.ok(Object.keys(c).every(k=>publicKeys.includes(k)),'Public case contains an unapproved field');
  assert.deepEqual(Object.keys(r).filter(key=>key!=='phylogeny').sort(),[...categories].sort());
  if(r.phylogeny)assert.ok(text(r.phylogeny.title)&&Array.isArray(r.phylogeny.rows)&&r.phylogeny.rows.length>0&&r.phylogeny.rows.every(row=>text(row.label)&&text(row.text)));
  for(const category of categories){assert.ok(text(r[category].title));assert.ok(r[category].rows.length>0);assert.ok(r[category].rows.every(row=>text(row.label)&&text(row.text)));}
  assert.equal(r.interviews.interviews.length,6);assert.equal(r.interviews.rows.length,6);
  for(let i=0;i<6;i++){assert.equal(r.interviews.rows[i].label,c.patients[i].name);assert.equal(r.interviews.rows[i].text,r.interviews.interviews[i]);}
  for(const category of ['windows','outside'])assert.deepEqual(r[category].rows.map(row=>row.label),c.patients.map(p=>p.name));
  c.patients.forEach((p,i)=>assert.equal(r.windows.rows[i].text,incubationWindow(c,p),'Incubation-window dates disagree with onset'));
  assert.equal(r.contacts.rows.length,r.contacts.contacts.length);
  const contacts=r.contacts.contacts,seen=new Set();
  const index=i=>Number.isInteger(i)&&i>=0&&i<6;
  for(let k=0;k<contacts.length;k++){
   const edge=contacts[k];assert.equal(edge.length,3);const [i,j,d]=edge;
   assert.ok(index(i)&&index(j)&&i!==j&&Number.isInteger(d)&&d>=1&&d<=monthDays);
   const key=[Math.min(i,j),Math.max(i,j),d].join(':');assert.ok(!seen.has(key));seen.add(key);
   assert.ok(r.contacts.rows[k].text.includes(c.patients[i].name)&&r.contacts.rows[k].text.includes(c.patients[j].name));
   assert.equal(r.contacts.rows[k].label,`${c.month} ${d}`);
  }
  const clusterSize=a.cluster.length,separate=Array.isArray(a.separate)?a.separate:[a.separate];
  assert.ok(clusterSize>=3&&clusterSize<=6);assert.equal(new Set(a.cluster).size,clusterSize);assert.ok(a.cluster.every(index));
  assert.equal(new Set(separate).size,separate.length);assert.ok(separate.every(i=>index(i)&&!a.cluster.includes(i)));
  assert.equal(clusterSize+separate.length,6,'Cluster and separate introductions must partition the roster');
  if(clusterSize!==5)assert.ok(text(c.objective),'Variable-size clusters require a case-specific objective');
  assert.equal(a.snpMatrix.length,6);
  const m=a.snpMatrix;
  for(let i=0;i<6;i++){
   assert.equal(m[i].length,6);assert.equal(m[i][i],0);
   for(let j=0;j<6;j++){
    assert.ok(Number.isInteger(m[i][j])&&m[i][j]>=0);assert.equal(m[i][j],m[j][i]);
    for(let k=0;k<6;k++)assert.ok(m[i][j]<=m[i][k]+m[k][j],'SNP matrix violates triangle inequality');
    if(i!==j)assert.ok(a.cluster.includes(i)&&a.cluster.includes(j)?m[i][j]<=4:m[i][j]>=20);
   }
   const row=r.genomics.rows[i+1];assert.ok(row.text.startsWith(c.patients[i].name+':'));
   for(let j=0;j<6;j++)if(i!==j)assert.ok(row.text.includes(`${c.patients[j].name} ${m[i][j]} SNPs`),'SNP text disagrees with matrix');
  }
  separate.forEach((i,k)=>assert.ok(r.genomics.rows[0].text.includes(`${c.patients[i].name}: distinct lineage ${String.fromCharCode(66+k)}`)));
  assert.deepEqual(r.genomics.rows.map(row=>row.text),r.genomics.genomics);
  // Enumerate all temporal directions; determine roots independently of the supplied solution.
  const directed=[];
  for(const [i,j,d] of contacts)if(a.cluster.includes(i)&&a.cluster.includes(j))for(const [x,y] of [[i,j],[j,i]]){
   const lag=c.patients[y].onset-d;
   if(c.patients[x].onset<=d&&lag>=1&&lag<=4)directed.push([x,y]);
  }
  const reach=(root,edges)=>{const found=new Set([root]);for(let k=0;k<6;k++)for(const [x,y] of edges)if(found.has(x))found.add(y);return found;};
  const roots=a.cluster.filter(root=>reach(root,directed).size===clusterSize);
  assert.equal(roots.length,1,'Source is ambiguous or impossible under the stated model');assert.equal(s.source,roots[0]);
  assert.equal(s.tree.length,clusterSize-1);assert.equal(reach(s.source,s.tree).size,clusterSize);
  const children=new Set();
  for(const edge of s.tree){assert.equal(edge.length,2);const [i,j]=edge;assert.ok(directed.some(([x,y])=>x===i&&y===j),'Solution arrow has no valid dated contact');assert.ok(!children.has(j));children.add(j);}
  assert.ok(!children.has(s.source));assert.ok(text(s.explanation));assert.equal(s.reveal.length,5);assert.ok(s.reveal.every(step=>text(step.title)&&text(step.text)));
  const words=[c.brief,...Object.values(r).flatMap(report=>report.rows.map(row=>row.text))].join(' ').split(/\s+/).length;
  assert.ok(words<=650,'Evidence reading load exceeds pilot limit');
  summaries.push({date,title:c.title,difficulty:a.difficulty,words,validSourceCount:roots.length});
 }
 assertAnswerVariety(pack.cases);
 return summaries;
}

export const withPhylogeny=reports=>({...reports,phylogeny:reports.phylogeny??{title:'Phylogenetic tree · reported sample lineages',rows:reports.genomics.rows,note:'Unresolved lineage grouping; branches do not establish direct transmission or its direction.'}});

const literal=x=>"'"+JSON.stringify(x).replaceAll("'","''")+"'::jsonb";
export function privateSQL(pack){
 validatePack(pack);
 // One transaction, deterministic order, no existing-row updates, and exact-match idempotency.
 let tag='$pack$';while(JSON.stringify(pack).includes(tag))tag=tag.slice(0,-1)+'_$';
 return '-- PRIVATE: contains unreleased evidence and solutions. Never commit or serve this file.\nbegin;\nset local standard_conforming_strings=on;\nselect pg_advisory_xact_lock(hashtextextended(\'viriddle-answer-variety\',0));\n'+
  [...pack.cases].sort((a,b)=>a.date.localeCompare(b.date)).map(({date,case:c,reports,solution})=>`do ${tag}\n`+
   `declare existing public.daily_cases; sealed private.case_secrets; new_id uuid;\nbegin\n`+
   `perform pg_advisory_xact_lock(hashtextextended('viriddle-daily:${date}',0));\n`+
   `select * into existing from public.daily_cases where case_date='${date}' for update;\n`+
   `if existing.id is not null then\n`+
   `select * into sealed from private.case_secrets where case_id=existing.id;\n`+
   `if existing.public_data is distinct from ${literal(c)} or sealed.solution is distinct from ${literal(solution)} or sealed.reports is distinct from ${literal(withPhylogeny(reports))} or existing.published_at is distinct from '${date}T00:00:00Z'::timestamptz then raise exception 'Conflicting case at ${date}; no existing data was overwritten.'; end if;\n`+
   `else\n`+
   `if '${date}'::date <= (clock_timestamp() at time zone 'UTC')::date then raise exception 'Only future new cases may be scheduled.'; end if;\n`+
   `insert into public.daily_cases(case_date,published_at,public_data) values('${date}','${date}T00:00:00Z',${literal(c)}) returning id into new_id;\n`+
   `insert into private.case_secrets(case_id,solution,reports) values(new_id,${literal(solution)},${literal(withPhylogeny(reports))});\n`+
   `end if;\nend ${tag};`).join('\n')+'\n'+answerVarietySQL()+'commit;\n';
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [command,path]=process.argv.slice(2);
 if(!['validate','sql'].includes(command)||!path)throw Error('Usage: node scripts/private-case-pack.mjs validate|sql /absolute/path/pack.private.json');
 const pack=JSON.parse(readFileSync(path,'utf8'));
 console.log(command==='validate'?JSON.stringify(validatePack(pack),null,2):privateSQL(pack));
}
