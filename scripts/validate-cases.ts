import { roomBookings, exposureWindows, outsideExposureChecks } from '../src/evidenceDetails.ts';
import assert from 'node:assert/strict';
import { cases, caseFor, nyDate, friendNames, sampleCase, formatCaseText, evidence } from '../src/cases.ts';
import { answerKeys } from '../src/answerKeys.ts';
import { CASE_TIME_MS, remainingMs, elapsedSeconds, clockText, calculateScore, upgradeDeadline } from '../src/gameRules.ts';
assert.equal(cases.length,10);
assert.equal(new Set(cases.map(c=>c.id)).size,cases.length);
for(const c of cases){
 const key=answerKeys[c.id];assert.ok(key,c.id+' answer key');assert.equal(c.patients.length,6);if(c.hypotheses){assert.equal(c.hypotheses.length,6);assert.ok(c.hypotheses[key.source]);assert.equal(key.outcome,'unresolved');assert.deepEqual(key.tree,[]);continue;}assert.equal(key.tree.length,4);
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
assert.equal(CASE_TIME_MS,240000);assert.equal(remainingMs(deadline,deadline+1),0);assert.equal(remainingMs(deadline,deadline-240000),240000);
assert.equal(clockText(240000),'04:00');assert.equal(clockText(59999),'01:00');assert.equal(clockText(1),'00:01');assert.equal(clockText(0),'00:00');
assert.equal(elapsedSeconds(deadline,deadline-CASE_TIME_MS),0);assert.equal(elapsedSeconds(deadline,deadline-1000),239);assert.equal(elapsedSeconds(deadline,deadline+10000),240);
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

assert.equal(friendNames.length,18);
assert.ok(!friendNames.includes('Sergei'));
for(const name of ['Lucy','Nate','Cherie','Bob','Nídia','Bret','Luke','Joicy','Ben','Anthony','Hamilton'])assert.ok(friendNames.includes(name));
const shown=new Set(Array.from({length:cases.length},(_,i)=>sampleCase(i).patients).flat().map(p=>p.name));
for(const name of friendNames)assert.ok(shown.has(name),name+' appears in examples');
console.log('PASS: 18-name roster, added friends, removed name, and complete example coverage.');

const start=2000000, end=start+CASE_TIME_MS;
const points=(seconds:number,cost=0,correct=true,relaxed=false)=>calculateScore({correct,evidenceCost:cost,deadlineAt:end,now:start+seconds*1000,relaxed});
assert.equal(points(0).score,100);assert.equal(points(4.8).score,99);assert.equal(points(30,22).score,72);
assert.equal(points(120,22).score,53);assert.equal(points(239,40).score,11);assert.equal(points(240).score,0);
assert.equal(points(241).score,0);assert.equal(points(10,22,false).score,0);assert.equal(points(100,22,true,true).score,78);
assert.equal(points(100,22,true,true).speedBonus,0);assert.equal(points(0,22).evidenceCost,22);
assert.equal(points(4.799).score,100);assert.equal(points(4.8).score,99);assert.equal(points(4.801).score,99);
for(let sec=1;sec<240;sec++)assert.ok(points(sec).score<=points(sec-1).score);
const breakdown=points(30,22);assert.equal(breakdown.basePoints+breakdown.speedBonus-breakdown.evidenceCost,breakdown.score);
assert.equal(calculateScore({correct:true,evidenceCost:0,now:start}).score,0);
console.log('PASS: faster correct answers earn more, evidence costs stay fixed, exact time boundaries, zero for failures, untimed practice, and score breakdown.');

assert.equal(evidence.length,6);assert.equal(new Set(evidence.map(e=>e.id)).size,6);
assert.deepEqual(evidence.map(e=>e.cost),[4,6,10,12,14,18]);
for(let i=0;i<cases.length;i++){
 const c=sampleCase(i),windows=exposureWindows(c),outside=outsideExposureChecks(c),rooms=roomBookings(c);
 assert.equal(windows.length,c.patients.length);assert.deepEqual(windows.map(w=>w.name),c.patients.map(p=>p.name));
 if(c.hypotheses){assert.equal(windows[0].start,'Jun 2');assert.equal(windows[0].end,'Jun 6');assert.ok(c.evidenceOverrides?.outside);continue;}
 assert.equal(outside.filter(r=>r.confirmed).length,2,c.id+' two corroborating outside records');
 assert.ok(outside[answerKeys[c.id].source].confirmed,c.id+' simulated source has outside record');
 assert.ok(rooms.length>0);for(const r of rooms)assert.ok(r.bookedFor>=2&&r.bookedFor<=6);
}
const early=exposureWindows(sampleCase(1)).find(w=>w.name===sampleCase(1).patients[5].name)!;
assert.equal(early.start,'Sep 28');assert.equal(early.end,'Oct 1');
assert.equal(calculateScore({correct:true,evidenceCost:64,deadlineAt:200000,now:170000}).score,0);
console.log('PASS: six uniquely priced evidence tools, public clue records, renamed patients, cross-month windows, and nonnegative exhausted scores.');

const {utcDate}=await import('../src/publicCase.ts');
assert.equal(utcDate(new Date('2026-10-30T00:00:00Z')),'2026-10-30');
assert.equal(utcDate(new Date('2026-10-29T23:59:59Z')),'2026-10-29');
console.log('PASS: new UTC daily reset changes at exactly 00:00 UTC.');

const upgraded=upgradeDeadline(200000,150000,100000);
assert.deepEqual(upgraded,{deadlineAt:290000,durationMs:240000});
assert.deepEqual(upgradeDeadline(upgraded.deadlineAt,upgraded.durationMs,101000),upgraded);
assert.deepEqual(upgradeDeadline(100000,150000,100000),{deadlineAt:100000,durationMs:150000});
assert.equal(calculateScore({correct:true,evidenceCost:22,deadlineAt:150000,now:30000,durationMs:150000}).score,68);
console.log('PASS: one-time local timer extension, no revival/reset, and legacy 150-second score compatibility.');

// The reference mystery adds story without changing the answer or exceeding a short session.
const october=sampleCase(0);
assert.deepEqual(october.contacts,[[1,2,9],[2,3,12],[2,4,12],[3,5,14]]);
assert.equal(october.contactDetails?.length,october.contacts.length);
assert.equal(answerKeys.october.reveal?.length,5);
for(const p of october.patients){const n=p.interview.split(/\s+/).length;assert.ok(n>=30&&n<=60,'Brief, distinct interview accounts');}
const reading=[october.brief,october.interviewNote,...october.patients.map(p=>p.interview),...october.contactDetails!,...october.genomics,...roomBookings(october).map(r=>r.description??''),...outsideExposureChecks(october).map(r=>r.details)].join(' ').split(/\s+/).length;
assert.ok(reading<=550,'Story and evidence fit the 3–4 minute target');
for(const step of answerKeys.october.reveal!){const text=formatCaseText(october,step.title+' '+step.text);for(const old of cases[0].patients.map(p=>p.name))assert.ok(!new RegExp('\\b'+old+'\\b').test(text),'Reveal uses rotated names');}
assert.equal(CASE_TIME_MS,240000,'Four-minute cap retained');
console.log(`PASS: reference mystery has ${reading} story/evidence words, dated encounters, rotated reveal names, and unchanged four-minute cap.`);

const hospital=sampleCase(9),hospitalKey=answerKeys[hospital.id];
assert.equal(caseFor('2026-11-13').id,hospital.id);
assert.equal(caseFor('2026-11-12').id,'signal');
assert.equal(hospitalKey.source,5);assert.equal(hospitalKey.outcome,'unresolved');assert.equal(hospitalKey.tree.length,0);
assert.ok(hospital.hypotheses![5].includes('individual source unresolved'));
assert.equal(hospital.patients.filter(p=>p.onset<14).length,4);
const hospitalWords=[hospital.brief,hospital.interviewNote,...hospital.patients.map(p=>p.interview),...hospital.genomics,...Object.values(hospital.evidenceOverrides!).flatMap(r=>r.rows.map(row=>row.text))].join(' ').split(/\s+/).length;
assert.ok(hospitalWords<680,'Hospital story fits a short investigation');
const {hypothesisLabel,caseObjective}=await import('../src/publicCase.ts');
assert.equal(hypothesisLabel(hospital,5),hospital.hypotheses![5]);
assert.equal(hypothesisLabel(october,1),october.patients[1].name);
assert.ok(caseObjective(hospital).includes('explanation'));
console.log(`PASS: hospital mystery, six explanation choices, 2–6 day windows, no invented transmission arrows, and ${hospitalWords} story/evidence words.`);

// Working board must never expose purchased clues before purchase, even in a practice payload.
const {boardEvents,visibleClues,cleanNotebook}=await import('../src/notebook.ts');
const {evidenceReports}=await import('../src/evidenceReports.ts');
const hospitalReports=evidenceReports(hospital);
assert.equal(boardEvents(hospital,hospitalReports,[]).length,6);
assert.deepEqual(visibleClues(hospitalReports,[]),[]);
const recordEvents=boardEvents(hospital,hospitalReports,['outside']);
assert.equal(recordEvents.filter(e=>e.kind==='sample').length,2);
assert.equal(recordEvents.find(e=>e.kind==='sample')?.day,9);
assert.equal(recordEvents.find(e=>e.kind==='report')?.day,18);
assert.equal(boardEvents(hospital,hospitalReports,['outside','genomics']).filter(e=>e.kind==='sample').length,2,'One timeline entry per identical event');
assert.equal(boardEvents(hospital,hospitalReports,['contacts']).filter(e=>e.kind==='contact').length,3);
assert.ok(!recordEvents.some(e=>e.kind==='contact'));
assert.ok(visibleClues(hospitalReports,['outside']).every(r=>r.category==='outside'));
assert.deepEqual(cleanNotebook({pinned:['outside:0','outside:0','bad'],marks:{0:'possible',6:'possible',1:'auto-answer'},note:'x'.repeat(650)}),{pinned:['outside:0'],marks:{0:'possible'},note:'x'.repeat(600)});
assert.deepEqual(cleanNotebook(null),{pinned:[],marks:{},note:''});
console.log('PASS: notebook validation, locked evidence isolation, contact gating, duplicate event merging, and distinct collection/report dates.');
