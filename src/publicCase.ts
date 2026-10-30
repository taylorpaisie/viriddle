import type {Case} from './model';
export const utcDate=(d=new Date())=>d.toISOString().slice(0,10);
export const formatCaseText=(c:Case,text:string)=>{if(!c.nameMap)return text;const names=Object.keys(c.nameMap);return text.replace(new RegExp('\\b('+names.join('|')+')\\b','g'),n=>c.nameMap![n]);};
export const caseNumber=(date:string)=>String(Math.floor((Date.parse(date+'T12:00Z')-Date.parse('2026-10-02T12:00Z'))/86400000)+1).padStart(3,'0');

// A hypothesis index can identify a patient or a case-specific explanation.
export const hypothesisLabel=(c:Case,index:number|null|undefined)=>index==null?'No hypothesis selected':c.hypotheses?.[index]??c.patients[index]?.name??'Unknown hypothesis';
export const caseObjective=(c:Case)=>c.objective??'Identify the source of the connected five-person cluster.';
