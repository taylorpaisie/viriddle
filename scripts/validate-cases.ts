import assert from 'node:assert/strict';
import { cases, caseFor, nyDate, friendNames, sampleCase, formatCaseText } from '../src/cases.ts';
import { answerKeys } from '../src/answerKeys.ts';
import { CASE_TIME_MS, remainingMs, elapsedSeconds, clockText } from '../src/gameRules.ts';
assert.equal(cases.length,9);
assert.equal(new Set(cases.map(c=>c.id)).size,cases.length);
for(const c of cases){
 const key=answerKeys[c.id];assert.ok(key,c.id+' answer key');assert.equal(c.patients.length,6);assert.equal(key.tree.length,4);
 const group=new Set<number>();const indegree=new Map<number,number>();
 for(const [a,b] of key.tree){
  const contact=c.contacts.find(([x,y])=>(x===a&&y===b)||(x===b&&y===a));
  assert.ok(contact,c.id+' transmission requires a documented contact');
  assert.ok(contact[2]>=c.patients[a].onset,c.id+' source must be infectious');
  const lag=c.patients[b].onset-contact[2];assert.ok(lag>=1&&lag<=4,c.id+' incubation must fit');
  group.add(a);group.add(b);indegree.set(b,(indegree.get(b)||0)+1);
 }
 assert.equal(group.size,5);assert.ok(group.has(key.source));assert.equal(indegree.get(key.source)||0,0);
 for(const p of group)if(p!==key.source)assert.equal(indegree.get(p),1,c.id+' one parent per simulated infection');
 const reached=new Set([key.source]);for(let i=0;i<5;i++)for(const [a,b] of key.tree)if(reached.has(a))reached.add(b);
 assert.equal(reached.size,5,c.id+' source reaches every cluster member');
 for(const [a,b,d] of c.contacts){assert.ok(a!==b);assert.ok(c.patients[a]&&c.patients[b]);assert.ok(d>=1&&d<=31)}
}
// Existing cases do not change when the expanded rotation starts.
assert.equal(caseFor('2026-10-28').id,'glasshouse');assert.equal(caseFor('2026-10-29').id,'october');
assert.equal(caseFor('2026-10-30').id,'rehearsal');assert.equal(caseFor('2026-11-04').id,'riverside');
assert.equal(caseFor('2026-11-08').id,caseFor('2026-10-30').id);
assert.equal(nyDate(new Date('2026-10-30T03:59:59Z')),'2026-10-29');assert.equal(nyDate(new Date('2026-10-30T04:00:00Z')),'2026-10-30');
const deadline=1000000;
assert.equal(CASE_TIME_MS,150000);assert.equal(remainingMs(deadline,deadline+1),0);assert.equal(remainingMs(deadline,deadline-150000),150000);
assert.equal(clockText(150000),'02:30');assert.equal(clockText(59999),'01:00');assert.equal(clockText(1),'00:01');assert.equal(clockText(0),'00:00');
assert.equal(elapsedSeconds(deadline,deadline-CASE_TIME_MS),0);assert.equal(elapsedSeconds(deadline,deadline-1000),149);assert.equal(elapsedSeconds(deadline,deadline+10000),150);
console.log('PASS: 9 case trees, contact/incubation constraints, historical scheduling, New York midnight, and deadline boundaries.');

for(let day=0;day<9;day++){
 const c=sampleCase(day);assert.equal(new Set(c.patients.map(p=>p.name)).size,6);
 for(const p of c.patients)assert.ok(friendNames.includes(p.name));
 const explanation=formatCaseText(c,answerKeys[c.id].explanation);
 for(const old of cases[day].patients.map(p=>p.name))assert.ok(!new RegExp('\\b'+old+'\\b').test(explanation));
}
assert.deepEqual(caseFor('2026-10-30').patients,caseFor('2026-10-30').patients);
assert.notDeepEqual(caseFor('2026-10-30').patients.map(p=>p.name),caseFor('2026-10-31').patients.map(p=>p.name));
assert.ok(Array.from({length:9},(_,i)=>sampleCase(i).patients).flat().some(p=>p.name==='Nídia'));
console.log('PASS: rotating friend names, unique patient labels, consistent explanation names, and Unicode accent.');

assert.equal(friendNames.length,12);
assert.ok(!friendNames.includes('Sergei'));
for(const name of ['Lucy','Nate','Cherie','Bob','Nídia'])assert.ok(friendNames.includes(name));
const shown=new Set(Array.from({length:cases.length},(_,i)=>sampleCase(i).patients).flat().map(p=>p.name));
for(const name of friendNames)assert.ok(shown.has(name),name+' appears in examples');
console.log('PASS: 12-name roster, added friends, removed name, and complete example coverage.');
