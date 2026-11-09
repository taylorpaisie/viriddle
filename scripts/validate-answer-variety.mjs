import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {answerPattern,assertAnswerVariety,answerVarietySQL} from './answer-variety.mjs';
const entry=(n,rank,source=n%6)=>({date:`2099-11-${String(n+1).padStart(2,'0')}`,case:{patients:Array.from({length:6},(_,i)=>({onset:i===source?5:i===((source+1)%6)&&rank===2?3:8}))},solution:{source}});
assert.throws(()=>assertAnswerVariety(Array.from({length:4},(_,i)=>entry(i,2))),/Answer variety/);
assert.throws(()=>assertAnswerVariety([2,2,1,2,2,2,2].map((r,i)=>entry(i,r))),/Answer variety/);
assert.throws(()=>assertAnswerVariety(Array.from({length:4},(_,i)=>entry(i,i%2+1,0))),/Answer variety/);
const varied=[1,2,2,1,1,2,1].map((r,i)=>entry(i,r));assertAnswerVariety(varied);
assertAnswerVariety([...varied].reverse());
const unresolved=entry(2,1);unresolved.solution.outcome='unresolved';
assert.equal(answerPattern(unresolved).onset,null);
const tie=entry(0,1);tie.case.patients[1].onset=5;assert.equal(answerPattern(tie).onset,'1:2');
const db=new PGlite();
try{
 await db.exec('create schema private;create table public.daily_cases(id int primary key,case_date date,public_data jsonb);create table private.case_secrets(case_id int,solution jsonb);');
 const load=async entries=>{await db.exec('truncate public.daily_cases,private.case_secrets');for(const [i,e] of entries.entries()){await db.query('insert into public.daily_cases values($1,$2,$3)',[i,e.date,e.case]);await db.query('insert into private.case_secrets values($1,$2)',[i,e.solution]);}};
 await load(varied);await db.exec(answerVarietySQL());
 // Real scheduling guard catches repeating one-case uploads across the pack boundary.
 await load(Array.from({length:4},(_,i)=>entry(i,2)));await assert.rejects(()=>db.exec(answerVarietySQL()),/Answer variety check failed/);
 await load([2,2,1,2,2,2,2].map((r,i)=>entry(i,r)));await assert.rejects(()=>db.exec(answerVarietySQL()),/Answer variety/);
 await load(Array.from({length:4},(_,i)=>entry(i,i%2+1,0)));await assert.rejects(()=>db.exec(answerVarietySQL()),/Answer variety/);
 await load([entry(0,2),entry(1,2),unresolved,entry(3,2)]);await db.exec(answerVarietySQL());
 // Old streaks remain immutable; new cases must break them, rather than inherit them.
 const past=Array.from({length:7},(_,i)=>({...entry(i,2),date:`2020-11-${i+10}`}));
 await load(past);await db.exec(answerVarietySQL());
 await load([...past,entry(8,1)]);await db.exec(answerVarietySQL());
 await load([...past,entry(8,2)]);await assert.rejects(()=>db.exec(answerVarietySQL()),/Answer variety/);
 await load(varied);await db.exec('begin');await db.query('insert into public.daily_cases values(99,$1,$2)',[entry(8,1,0).date,entry(8,1,0).case]);await db.query('insert into private.case_secrets values(99,$1)',[entry(8,1,0).solution]);await db.exec(answerVarietySQL());await db.exec('rollback');assert.equal((await db.query('select count(*)::int as n from public.daily_cases')).rows[0].n,varied.length);
 console.log('PASS: onset shortcuts, roster shortcuts, seven-case dominance, ties, unresolved outcomes, pack boundaries, historical preservation and SQL guard.');
}finally{await db.close();}
