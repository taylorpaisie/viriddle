import type {Case,EvidenceReport} from './model';
export type Mark='possible'|'ruled-out';
export type Notebook={pinned:string[];marks:Record<string,Mark>;note:string};
export const emptyNotebook=():Notebook=>({pinned:[],marks:{},note:''});
export function cleanNotebook(value:unknown):Notebook{
 const v=value&&typeof value==='object'?value as Partial<Notebook>:{};
 const pinned=Array.isArray(v.pinned)?[...new Set(v.pinned.filter((x):x is string=>typeof x==='string'&&/^[a-z]+:\d+$/.test(x)))].slice(0,12):[];
 const marks:Record<string,Mark>={};if(v.marks&&typeof v.marks==='object')for(const [k,m] of Object.entries(v.marks))if(/^[0-5]$/.test(k)&&(m==='possible'||m==='ruled-out'))marks[k]=m;
 return {pinned,marks,note:typeof v.note==='string'?v.note.slice(0,600):''};
}
export function visibleClues(reports:Record<string,EvidenceReport>,unlocked:string[]){return Object.entries(reports).filter(([id])=>unlocked.includes(id)).flatMap(([category,r])=>r.rows.map((row,i)=>({id:category+':'+i,category,title:r.title,...row})));}
export type BoardEvent={id:string;day:number;kind:string;label:string;detail?:string;patient?:number};
// Uses public onset dates and purchased evidence only. Never accepts a solution/answer key.
export function boardEvents(c:Case,reports:Record<string,EvidenceReport>,unlocked:string[]):BoardEvent[]{
 const events:BoardEvent[]=c.patients.map((p,i)=>({id:'onset:'+i,day:p.onset,kind:'symptoms',label:p.name+' · symptoms begin',patient:i}));
 if(unlocked.includes('contacts'))c.contacts.forEach(([a,b,day],i)=>{if(c.patients[a]&&c.patients[b])events.push({id:'contact:'+i,day,kind:'contact',label:c.patients[a].name+' ↔ '+c.patients[b].name,detail:'Reported interaction · transmission unconfirmed'});});
 for(const [category,report] of Object.entries(reports))if(unlocked.includes(category))for(const [i,event] of (report.events??[]).entries())if(Number.isInteger(event.day)&&event.day>=1&&event.day<=31&&event.label)events.push({...event,id:category+':event:'+i});
 const unique=new Map<string,BoardEvent>();for(const e of events)unique.set(e.kind+':'+e.day+':'+e.label,e);return [...unique.values()].sort((a,b)=>a.day-b.day||a.id.localeCompare(b.id));
}
