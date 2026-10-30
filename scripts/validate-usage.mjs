import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite();const q=async(sql,args=[])=>(await db.query(sql,args)).rows;
try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,is_anonymous boolean default false);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
 for(const file of ['202610290001_outbreak.sql','202610290002_four_minute_window.sql','20261030121235_five_minute_window.sql','20261030194435_internal_usage_filter.sql'])await db.exec(await fs.readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
 const owner='22222222-2222-4222-8222-222222222221',guest='22222222-2222-4222-8222-222222222222',other='22222222-2222-4222-8222-222222222223';
 for(const [i,id] of [owner,guest,other].entries())await q(`insert into auth.users values($1,$2);`,[id,i===1]);
 for(const [i,id] of [owner,guest,other].entries())await q(`insert into public.players(id,username,created_at) values($1,$2,'2026-10-29 12:00Z')`,[id,'Tester_'+i]);
 const caseIds=['33333333-3333-4333-8333-333333333331','33333333-3333-4333-8333-333333333332'];
 for(const [i,id] of caseIds.entries())await q(`insert into public.daily_cases(id,case_date,published_at,public_data) values($1,$2,'2026-10-28','{}')`,[id,'2026-10-'+(29+i)]);
 const add=async(id,c,start)=>q(`insert into public.daily_attempts(player_id,case_id,started_at,completed_at,elapsed_seconds,score,correct_solution,status) values($1,$2,$3,$3::timestamptz+interval '30 seconds',30,85,true,'completed')`,[id,c,start]);
 await add(owner,caseIds[0],'2026-10-29 23:59:59Z');
 const before=JSON.stringify(await q('select * from public.daily_attempts order by player_id,case_id'));
 await q('insert into private.analytics_internal_players(player_id) values($1)',[owner]);
 let summary=(await q('select * from private.usage_summary'))[0];assert.equal(summary.only_internal_daily_attempts,true);assert.equal(Number(summary.other_daily_attempts_started),0);assert.equal(Number(summary.excluded_daily_attempts),1);assert.equal(Number(summary.other_player_identities),2);
 assert.equal(JSON.stringify(await q('select * from public.daily_attempts order by player_id,case_id')),before,'Marking internal never changes attempts');
 await add(owner,caseIds[1],'2026-10-30 00:00:00Z');await add(guest,caseIds[1],'2026-10-30 00:00:00Z');await add(other,caseIds[0],'2026-10-29 23:59:59Z');
 await db.exec("set timezone='America/New_York'");
 summary=(await q('select * from private.usage_summary'))[0];assert.equal(summary.only_internal_daily_attempts,false);assert.equal(Number(summary.excluded_daily_attempts),2);assert.equal(Number(summary.other_daily_attempts_started),2);assert.equal(Number(summary.other_daily_players),2);assert.equal(Number(summary.other_solved_attempts),2);
 const days=await q('select * from private.usage_daily order by day_utc');assert.equal(days.length,2);for(const day of days){assert.equal(Number(day.other_attempts_started),1);assert.equal(Number(day.excluded_attempts),1);}assert.equal(Number(days[0].new_other_identities),2);
 // Account names and metadata are never a classifier; guests stay external unless explicitly marked.
 await q("update public.players set username='Creator' where id=$1",[guest]);assert.equal(Number((await q('select * from private.usage_summary'))[0].other_daily_players),2);
 for(const role of ['anon','authenticated']){
  await db.exec('set role '+role);
  for(const object of ['analytics_internal_players','usage_summary','usage_daily'])await assert.rejects(()=>q('select * from private.'+object),/permission denied/);
  await assert.rejects(()=>q('insert into private.analytics_internal_players(player_id) values($1)',[guest]),/permission denied/);
  await assert.rejects(()=>q('delete from private.analytics_internal_players'),/permission denied/);
  await db.exec('reset role');
 }
 const snapshot=JSON.stringify(await q('select * from public.daily_attempts order by player_id,case_id'));
 await q('delete from private.analytics_internal_players where player_id=$1',[owner]);assert.equal(Number((await q('select * from private.usage_summary'))[0].other_daily_attempts_started),4);assert.equal(JSON.stringify(await q('select * from public.daily_attempts order by player_id,case_id')),snapshot);
 await assert.rejects(()=>add(owner,caseIds[1],'2026-10-30 00:00:00Z'),/duplicate key/);
 await db.exec('delete from public.daily_attempts');summary=(await q('select * from private.usage_summary'))[0];assert.equal(summary.only_internal_daily_attempts,false);assert.equal(Number(summary.other_daily_attempts_started),0);
 console.log('PASS: retroactive internal exclusion, internal-only detection, external guest retention, UTC boundaries, no client reads/writes, reversible classification, unchanged scores and unique attempts.');
}finally{await db.close()}
