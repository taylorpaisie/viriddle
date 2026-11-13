// Owner-only authoring helper. Names change consistently; indices, dates and solutions do not.
import assert from 'node:assert/strict';
import {randomInt} from 'node:crypto';
export function ensureDarren(entry,slot){
 const patients=entry.case.patients;
 assert.ok(Array.isArray(patients)&&patients.length>0);
 const count=patients.filter(p=>p.name==='Darren').length;
 assert.ok(count<=1,'Darren must appear at most once');
 if(count===1)return structuredClone(entry);
 const index=slot??randomInt(patients.length);assert.ok(Number.isInteger(index)&&index>=0&&index<patients.length);
 const old=patients[index].name,escaped=old.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const pattern=new RegExp('(?<![\\p{L}\\p{N}_])'+escaped+'(?![\\p{L}\\p{N}_])','gu');
 const visit=value=>typeof value==='string'?value.replace(pattern,'Darren'):Array.isArray(value)?value.map(visit):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,visit(v)])):value;
 return visit(entry);
}
