import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {scheduleSQL,summarize} from './schedule-health.mjs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const db=new PGlite();
try{
 await db.exec(`create schema private;
 create table public.daily_cases(id int primary key,case_date date unique,published_at timestamptz,public_data jsonb);
 create table private.case_secrets(case_id int primary key,reports jsonb,solution jsonb);
 create role anon; create role authenticated;`);
 const reports=Object.fromEntries(['bookings','windows','interviews','contacts','outside','genomics','phylogeny'].map(k=>[k,{title:'SECRET_SENTINEL'}]));
 for(const [id,day,published] of [[1,'2026-12-30','2026-12-30T00:00:00Z'],[2,'2026-12-31','2026-12-31T00:00:00Z'],[3,'2027-01-02','2027-01-02T00:01:00Z'],[4,'2027-01-03','2027-01-03T00:00:00Z']]){
  await db.query('insert into public.daily_cases values ($1,$2,$3,$4)',[id,day,published,{title:'SECRET_SENTINEL'}]);
 }
 await db.query('insert into private.case_secrets values (1,$1,$2),(3,$1,$2),(4,$3,$4)',[reports,{source:'SECRET_SENTINEL'},{...reports,genomics:null},{}]);
 const query=scheduleSQL('2026-12-30',5);
 const snapshot=(await db.query(query)).rows[0].schedule_health;
 assert.ok(!JSON.stringify(snapshot).includes('SECRET_SENTINEL'));
 assert.deepEqual(summarize(snapshot),{start:'2026-12-30',days:5,ready:1,consecutive:1,issues:[
  {date:'2026-12-31',reasons:['missing reports','missing solution']},
  {date:'2027-01-01',reasons:['missing case']},
  {date:'2027-01-02',reasons:['late release']},
  {date:'2027-01-03',reasons:['missing reports','missing solution']}
 ]});
 assert.equal(summarize((await db.query(scheduleSQL('2026-12-30',1))).rows[0].schedule_health).issues.length,0);
 assert.equal(summarize((await db.query(scheduleSQL('2028-02-28',3))).rows[0].schedule_health).consecutive,0);
 await db.exec("set timezone='America/New_York'");
 assert.deepEqual((await db.query(query)).rows[0].schedule_health,snapshot);
 for(const role of ['anon','authenticated']){
  await db.exec(`set role ${role}`);await assert.rejects(()=>db.query(query),/permission denied/);await db.exec('reset role');
 }
 for(const value of ['2026-02-29',"2026-01-01';select 1;--",'bad'])assert.throws(()=>scheduleSQL(value));
 for(const value of [0,367,NaN,1.5])assert.throws(()=>scheduleSQL('2026-01-01',value));
 assert.throws(()=>summarize({...snapshot,dates:[]}));
 assert.throws(()=>summarize({...snapshot,dates:[...snapshot.dates].reverse()}));
 const cli=(args,input)=>spawnSync(process.execPath,[fileURLToPath(new URL('./schedule-health.mjs',import.meta.url)),...args],{input,encoding:'utf8'});
 assert.equal(cli(['check','-'],JSON.stringify(snapshot)).status,1);
 const healthy=(await db.query(scheduleSQL('2026-12-30',1))).rows[0].schedule_health;
 assert.equal(cli(['check','-'],JSON.stringify(healthy)).status,0);
 const invalid=cli(['check','-'],'SECRET_SENTINEL invalid JSON');
 assert.equal(invalid.status,2);assert.ok(!invalid.stderr.includes('SECRET_SENTINEL'));
 assert.equal(cli(['sql','2026-12-30','5']).stdout,query);
 assert.equal(cli(['sql','2026-02-29']).status,2);
 console.log('PASS: gaps, incomplete secrets, late releases, contiguous coverage, year/leap boundaries, UTC independence, metadata-only output and denied player access.');
}finally{await db.close();}
