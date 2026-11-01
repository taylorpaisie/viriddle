import assert from 'node:assert/strict';
import {evidence} from '../src/catalog.ts';
import {calculateScore,CASE_TIME_MS} from '../src/gameRules.ts';
import {models,score,combinations,distribution,markdown} from './score-balance-model.mjs';

const [current,proposed]=models(evidence),all=evidence.map(e=>e.id),sets=combinations(all);
assert.equal(sets.length,64);
assert.equal(new Set(sets.map(ids=>ids.join(','))).size,64);
assert.equal(Object.values(current.prices).reduce((a:number,b:number)=>a+b,0),64);
assert.equal(Object.values(proposed.prices).reduce((a:number,b:number)=>a+b,0),40);
for(const ids of sets){
 const cost=ids.reduce((sum,id)=>sum+current.prices[id],0);
 for(const seconds of [0,5.999,6,6.001,9.999,10,10.001,30,60,120,150,180,215.999,216,240,299,299.999,300,301]){
  for(const correct of [true,false])for(const relaxed of [true,false]){
   const expected=calculateScore({correct,evidenceCost:cost,deadlineAt:CASE_TIME_MS,now:seconds*1000,relaxed});
   const actual=score(current,ids,seconds,{correct,relaxed});
   assert.deepEqual(actual,{score:expected.score,base:expected.basePoints,speed:expected.speedBonus,cost:expected.evidenceCost});
   const next=score(proposed,ids,seconds,{correct,relaxed});
   assert.ok(next.score>=0&&next.score<=100);
   if(!correct||(!relaxed&&seconds>=300))assert.equal(next.score,0);
  }
 }
 let previous=100;
 for(let second=0;second<300;second++){
  const value=score(proposed,ids,second).score;
  assert.ok(value<=previous);assert.ok(value>=31);previous=value;
  for(const id of all.filter(id=>!ids.includes(id)))assert.ok(score(proposed,[...ids,id],second).score<=value);
 }
}
assert.equal(score(current,all,215.999).score,1);
assert.equal(score(current,all,216).score,0);
assert.equal(score(proposed,all,299.999).score,31);
assert.equal(score(proposed,all,300).score,0);
assert.equal(score(proposed,[],9.999).score,100);
assert.equal(score(proposed,[],10).score,99);
assert.equal(score(proposed,all,1000,{relaxed:true}).score,60);
for(const model of [current,proposed])for(const seconds of [0,60,150,240,299,300]){
 const d=distribution(model,seconds);
 assert.equal(Object.values(d.bins).reduce((a:number,b:number)=>a+b,0),64);
 assert.ok(d.min<=d.median&&d.median<=d.max);
}
for(const value of [-1,NaN,Infinity])assert.throws(()=>score(proposed,[],value));
assert.throws(()=>score(proposed,['unknown'],0));
assert.throws(()=>score(proposed,['contacts','contacts'],0));
assert.ok(markdown(evidence).includes('not observed players'));
console.log('PASS: all 64 subsets, parity with current gameplay, proposed score bounds, purchase/time monotonicity, fractional boundaries, timeout/failure, untimed practice and distribution totals.');
