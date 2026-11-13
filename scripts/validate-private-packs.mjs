import assert from 'node:assert/strict';
import {ensureDarren} from './ensure-darren.mjs';
import {incubationWindow} from './case-dates.mjs';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {validatePack,privateSQL} from './private-case-pack.mjs';

// Public synthetic test data only. Real upcoming puzzles never belong in this repository.
function synthetic(clusterSize=5,month='November'){
 const names=['Darren','Bravo','Charlie','Delta','Echo','Foxtrot'],onsets=[5,7,9,11,13,3];
 if(clusterSize===6)onsets[5]=15;
 const contacts=[...Array.from({length:clusterSize-1},(_,i)=>[i,i+1,5+i*2]),[5,2,7]];
 const rows=names.map(label=>({label,text:'Synthetic checked record.'}));
 const cluster=Array.from({length:clusterSize},(_,i)=>i),separate=Array.from({length:6-clusterSize},(_,i)=>i+clusterSize);
 const matrix=names.map((_,i)=>names.map((_,j)=>i===j?0:i>=clusterSize||j>=clusterSize?24:2));
 const genomics=[cluster.map(i=>names[i]).join(', ')+': lineage A. '+separate.map((i,k)=>names[i]+': distinct lineage '+String.fromCharCode(66+k)).join('; '),...names.map((name,i)=>name+': '+names.flatMap((other,j)=>j===i?[]:[`${other} ${matrix[i][j]} SNPs`]).join(', ')+'.')];
 return {version:1,cases:[{
  date:'2099-11-14',case:{id:'public-test-only',title:'Synthetic test',place:'Test room',month,objective:`Find the source of the ${clusterSize}-person related cluster.`,brief:'One introduction in the related cluster; independent introductions for the rest. Complete contacts; no pre-symptom spread.',pathogen:'Fictional',incubation:'1–4 days',incubationDays:[1,4],infectiousness:'From onset',patients:names.map((name,i)=>({name,role:'Tester',onset:onsets[i],interview:''})),contacts:[],genomics:[],practice_available:false},
  reports:Object.fromEntries(['bookings','windows','interviews','contacts','outside','genomics'].map(category=>[category,{title:category,rows:structuredClone(rows),...(category==='windows'?{rows:names.map((name,i)=>({label:name,text:incubationWindow({month,incubationDays:[1,4]},{onset:onsets[i]})}))}:{}),...(category==='interviews'?{interviews:rows.map(r=>r.text)}:{}),...(category==='contacts'?{contacts,rows:contacts.map(([i,j,d])=>({label:`${month} ${d}`,text:`${names[i]} ↔ ${names[j]}`}))}:{}),...(category==='genomics'?{genomics,rows:genomics.map(text=>({label:'Laboratory',text}))}:{})}])),
  solution:{source:0,tree:contacts.slice(0,clusterSize-1).map(([i,j])=>[i,j]),explanation:'Synthetic solution only.',reveal:Array.from({length:5},()=>({title:'Test',text:'Explanation.'}))},audit:{cluster,separate,snpMatrix:matrix,difficulty:'Test'}
 }]};
}
for(const size of [3,4,5,6])for(const month of ['November','December','January'])assert.equal(validatePack(synthetic(size,month)).length,1);
const bad=change=>{const p=synthetic();change(p);assert.throws(()=>validatePack(p));};
bad(p=>p.cases[0].date='2099-11-31');bad(p=>p.cases.push(structuredClone(p.cases[0])));
bad(p=>p.cases[0].solution.source=1);bad(p=>p.cases[0].case.solution={source:0});
bad(p=>p.cases[0].case.patients[0].interview='SEALED');bad(p=>p.cases[0].case.contacts=[[0,1,5]]);
bad(p=>p.cases[0].reports.contacts.contacts[0][2]=1);bad(p=>p.cases[0].audit.snpMatrix[0][1]=99);
bad(p=>p.cases[0].case.practice_available=true);
bad(p=>p.cases[0].reports.windows.rows[0].text='Nov -1–Nov 2');
bad(p=>p.cases[0].audit.separate=[]);
bad(p=>p.cases[0].audit.separate=[5,5]);
bad(p=>p.cases[0].audit.cluster=[0,1,2,3]);
assert.equal(incubationWindow({month:'November'},{onset:3}),'Oct 30–Nov 2');
assert.equal(incubationWindow({month:'January'},{onset:1}),'Dec 28–Dec 31');
assert.equal(incubationWindow({month:'March'},{onset:2}),'Feb 26–Mar 1');

const db=new PGlite();
try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,is_anonymous boolean default false);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
 for(const file of ['202610290001_outbreak.sql','202610290002_four_minute_window.sql','20261030121235_five_minute_window.sql','20261030121809_curated_practice_examples.sql','20261102135440_phylogenetic_evidence.sql'])await db.exec(readFileSync(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
 const pack=process.argv[2]?JSON.parse(readFileSync(process.argv[2],'utf8')):synthetic();
 const summary=validatePack(pack),sql=privateSQL(pack);
 await db.exec(sql);await db.exec(sql);
 const records=(await db.query('select c.id,c.case_date,c.public_data,s.reports,s.solution from public.daily_cases c join private.case_secrets s on s.case_id=c.id order by c.case_date')).rows;
 assert.equal(records.length,pack.cases.length);
 // Apostrophes and a dollar delimiter in owner-authored story text must remain inert data.
 const escaped=synthetic();escaped.cases[0].date='2099-11-15';escaped.cases[0].case.id='quote-test';escaped.cases[0].case.brief="Author's text: $pack$; drop table public.daily_cases; --";
 await db.exec(privateSQL(escaped));
 assert.equal((await db.query("select public_data->>'brief' as brief from public.daily_cases where case_date='2099-11-15'")).rows[0].brief,escaped.cases[0].case.brief);
 const conflict=structuredClone(pack);conflict.cases[0].case.title+=' DIFFERENT';
 await assert.rejects(()=>db.exec(privateSQL(conflict)),/Conflicting case/);await db.exec('rollback');
 let user='30000000-0000-4000-8000-000000000001',wrongUser='30000000-0000-4000-8000-000000000002';await db.query('insert into auth.users(id) values($1),($2)',[user,wrongUser]);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);
 await db.exec('set role authenticated');
 assert.equal((await db.query('select * from public.daily_cases')).rows.length,0,'Future cases leaked');
 await assert.rejects(()=>db.query('select * from private.case_secrets'));
 await assert.rejects(()=>db.query('select public.outbreak_daily($1)',[records[0].id]));
 await db.exec('reset role');
 const purchase=['bookings','windows','interviews','contacts','outside','genomics','phylogeny'];
 for(let n=0;n<records.length;n++){
  const record=records[n];
  // Each test release uses fresh players so a large pack does not hit the real API rate limit.
  if(n>0){
   user='30000000-0000-4000-8000-'+String(n*2+1).padStart(12,'0');wrongUser='30000000-0000-4000-8000-'+String(n*2+2).padStart(12,'0');
   await db.query('insert into auth.users(id) values($1),($2)',[user,wrongUser]);
   await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);
  }
  // Simulate release in the isolated DB only. Production keeps original future release times.
  await db.query("update public.daily_cases set case_date=(clock_timestamp() at time zone 'UTC')::date,published_at=clock_timestamp()-interval '1 minute' where id=$1",[record.id]);
  await db.exec('set role authenticated');
  const action=async(kind,evidence=null,selected=null)=>(await db.query('select public.outbreak_action($1,$2,$3,$4) as state',[kind,record.id,evidence,selected])).rows[0].state;
  let state=await action('begin');assert.equal(state.attempt.duration_seconds,300);assert.equal(state.solution,undefined);assert.deepEqual(state.reports,{});
  assert.ok(state.case.patients.every(p=>p.interview===''));
  let count=0;
  for(const category of purchase){state=await action('purchase',category);assert.deepEqual(state.reports[category],record.reports[category]);assert.equal(Object.keys(state.reports).length,++count);assert.equal(state.solution,undefined);}
  assert.equal(state.attempt.evidence_cost,80);
  state=await action('submit',null,record.solution.source);assert.equal(state.attempt.correct_solution,true);assert.deepEqual(state.solution,record.solution);assert.ok(state.attempt.score>0&&state.attempt.score<=20);
  const score=state.attempt.score;state=await action('submit',null,(record.solution.source+1)%6);assert.equal(state.attempt.score,score);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[wrongUser]);await action('begin');
  state=await action('submit',null,(record.solution.source+1)%6);assert.equal(state.attempt.correct_solution,false);assert.equal(state.attempt.score,0);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);
  await db.exec('reset role');
  await db.query('update public.daily_cases set case_date=$1,published_at=$2 where id=$3',[pack.cases[n].date,pack.cases[n].date+'T00:00:00Z',record.id]);
 }
 const attemptsBefore=(await db.query('select * from public.daily_attempts order by id')).rows;
 await db.exec(sql);assert.deepEqual((await db.query('select * from public.daily_attempts order by id')).rows,attemptsBefore);
 // A late collision must roll back an earlier new insert in the same pack.
 const earlier=new Date(Date.parse(pack.cases[0].date+'T00:00:00Z')-86400000).toISOString().slice(0,10);
 const atomic=synthetic();atomic.cases[0].date=earlier;atomic.cases[0].case.id='atomic-insert';atomic.cases.push(structuredClone(pack.cases[0]));atomic.cases[1].case.title+=' conflict';
 await assert.rejects(()=>db.exec(privateSQL(atomic)),/Conflicting case/);await db.exec('rollback');
 assert.equal((await db.query('select * from public.daily_cases where case_date=$1',[earlier])).rows.length,0);
 const past=synthetic();past.cases[0].date='2020-11-01';await assert.rejects(()=>db.exec(privateSQL(past)),/Only future/);await db.exec('rollback');
 console.log(JSON.stringify({validatedCases:summary.length,readingWords:summary.map(s=>s.words),checks:'source uniqueness, contact timing, SNP consistency, sealed future cases, seven gated reports, five-minute scoring, idempotency, conflicts, atomic rollback, quote escaping, existing attempts preserved'},null,2));
}finally{await db.close();}

const naming={case:{patients:[{name:'Ann'},{name:'Anna'},{name:'Nídia'}],brief:'Ann and Anna spoke to Nídia.'},reports:{interviews:{rows:[{label:'Ann',text:'Anna was here.'}]}},solution:{source:1,tree:[[1,0]]}};
const renamed=ensureDarren(naming,0);assert.equal(renamed.case.brief,'Darren and Anna spoke to Nídia.');assert.equal(renamed.reports.interviews.rows[0].label,'Darren');assert.deepEqual(renamed.solution,naming.solution);assert.equal(naming.case.patients[0].name,'Ann');assert.deepEqual(ensureDarren(renamed,2),renamed);assert.equal(ensureDarren(naming,2).case.brief,'Ann and Anna spoke to Darren.');
