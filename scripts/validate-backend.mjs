import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite();
await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,is_anonymous boolean default false);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
await db.exec(await fs.readFile(new URL('../supabase/migrations/202610290001_outbreak.sql',import.meta.url),'utf8'));
// Existing finalized records keep their scores and original duration when the new migration is applied.
await db.exec(`insert into auth.users values('20000000-0000-4000-8000-000000000001',false);insert into public.players(id,username) values('20000000-0000-4000-8000-000000000001','Legacy_Player');insert into public.daily_cases(id,case_date,published_at,public_data) values('20000000-0000-4000-8000-000000000002','2020-01-01','2020-01-01','{}');insert into public.daily_attempts(player_id,case_id,completed_at,elapsed_seconds,score,correct_solution,status) values('20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002',now(),80,77,true,'completed');`);
await db.exec(await fs.readFile(new URL('../supabase/migrations/202610290002_four_minute_window.sql',import.meta.url),'utf8'));
const legacy=(await db.query("select score,duration_seconds from public.daily_attempts where player_id='20000000-0000-4000-8000-000000000001'")).rows[0];assert.equal(legacy.score,77);assert.equal(legacy.duration_seconds,150);

const u='00000000-0000-4000-8000-000000000001',v='00000000-0000-4000-8000-000000000002',c='00000000-0000-4000-8000-000000000003',future='00000000-0000-4000-8000-000000000004';
await db.exec(`insert into auth.users values('${u}',false),('${v}',false);insert into public.daily_cases(id,case_date,published_at,public_data) values('${c}',(now() at time zone 'UTC')::date,now()-interval '1 day','{"title":"Test","patients":[]}'),('${future}',(now() at time zone 'UTC')::date+1,now()+interval '1 day','{"title":"Future"}');insert into private.case_secrets values('${c}','{"source":1,"tree":[[1,2]],"explanation":"SEALED_SOLUTION"}','{"contacts":{"title":"Contacts","rows":[{"label":"Test","text":"SEALED_CONTACT"}]},"interviews":{"rows":[]}}');`);
const q=async(sql,args=[])=> (await db.query(sql,args)).rows;
async function user(id){await db.exec('reset role');await q(`select set_config('request.jwt.claim.sub',$1,false)`,[id]);await db.exec('set role authenticated');}
const call=async(name,args='')=>(await q(`select public.${name}(${args}) as data`))[0].data;
await user(u);let state=await call('outbreak_daily');assert.equal(state.solution,undefined);assert.deepEqual(state.reports,{});
await assert.rejects(()=>q(`select * from private.case_secrets`));await assert.rejects(()=>call('outbreak_daily',`'${future}'`));await assert.rejects(()=>call('outbreak_replay',`'${c}'`));
state=await call('outbreak_action',`'begin','${c}'`);const start=state.attempt.started_at;assert.equal(state.attempt.duration_seconds,240);
state=await call('outbreak_action',`'begin','${c}'`);assert.equal(state.attempt.started_at,start);
state=await call('outbreak_action',`'purchase','${c}','contacts'`);assert.equal(state.attempt.evidence_cost,12);assert.ok(state.reports.contacts);assert.equal(state.solution,undefined);
state=await call('outbreak_action',`'purchase','${c}','contacts'`);assert.equal(state.attempt.evidence_cost,12);assert.equal((await q(`select * from public.attempt_events where event_type='purchase'`)).length,1);
await assert.rejects(()=>call('outbreak_action',`'purchase','${c}','fake'`));await assert.rejects(()=>q(`update public.daily_attempts set score=100`));
await user(v);assert.equal((await q('select * from public.daily_attempts')).length,0);assert.equal((await q('select * from public.attempt_events')).length,0);
await call('outbreak_action',`'begin','${c}'`);await db.exec('reset role');await q(`update public.daily_attempts set started_at=clock_timestamp()-interval '241 seconds' where player_id=$1`,[v]);await user(v);state=await call('outbreak_daily');assert.equal(state.attempt.status,'timed_out');assert.equal(state.attempt.elapsed_seconds,240);assert.equal(state.attempt.score,0);assert.ok(state.solution);
await user(u);await call('outbreak_action',`'purchase','${c}','interviews'`);await db.exec('reset role');await q(`update public.daily_attempts set started_at=clock_timestamp()-interval '30 seconds' where player_id=$1`,[u]);await user(u);state=await call('outbreak_action',`'submit','${c}',null,1`);assert.equal(state.attempt.correct_solution,true);assert.equal(state.attempt.evidence_cost,22);assert.ok(state.attempt.score>=71&&state.attempt.score<=72);assert.ok(state.solution);const finalScore=state.attempt.score;
state=await call('outbreak_action',`'submit','${c}',null,0`);assert.equal(state.attempt.score,finalScore);assert.equal(state.attempt.selected_patient,1);
await call('outbreak_save_profile',`'Detective_One',true,true`);const profile=await call('outbreak_profile');assert.equal(profile.stats.total,1);assert.equal(profile.player.tutorial_completed_at!==null,true);
let board=await call('outbreak_leaderboard');assert.equal(board.rows.length,1);assert.equal(board.mine.username,'Detective_One');assert.equal(board.rows[0].email,undefined);
await user(v);board=await call('outbreak_leaderboard');assert.equal(board.rows.length,1);assert.equal(board.mine,null);
await db.exec('reset role');await q('update auth.users set is_anonymous=true where id=$1',[u]);await user(v);assert.equal((await call('outbreak_leaderboard')).rows.length,0);
// A wrong answer is finalized once at zero, even with time remaining.
await db.exec('reset role');await q(`delete from public.daily_attempts where player_id=$1`,[v]);await user(v);await call('outbreak_action',`'begin','${c}'`);state=await call('outbreak_action',`'submit','${c}',null,0`);assert.equal(state.attempt.score,0);assert.equal(state.attempt.correct_solution,false);
// Page limits and own position must work outside the first page.
await db.exec('reset role');await q('update auth.users set is_anonymous=false where id=$1',[u]);
await db.exec(`insert into auth.users(id) select ('10000000-0000-4000-8000-'||lpad(g::text,12,'0'))::uuid from generate_series(1,30) g;insert into public.players(id,username,public_profile_enabled) select id,'Board-'||right(id::text,12),true from auth.users where id::text like '10000000%';insert into public.daily_attempts(player_id,case_id,completed_at,elapsed_seconds,score,correct_solution,status) select id,'${c}',now(),10,99,true,'completed' from public.players where id::text like '10000000%';`);
await user(u);board=await call('outbreak_leaderboard');assert.equal(board.rows.length,25);assert.equal(board.mine.position,31);board=await call('outbreak_leaderboard',"'all',25");assert.equal(board.rows.length,6);
await db.exec('reset role');await db.exec('set role anon');await assert.rejects(()=>call('outbreak_daily'));await assert.rejects(()=>q('select private.expire_attempts()'));
console.log('PASS: real PostgreSQL migration, RLS isolation, sealed evidence/solutions, unique starts, idempotent purchases/submissions, timeouts, wrong answers, profiles, tutorial persistence, opt-in leaderboards, and anonymous exclusion.');
await db.close();
