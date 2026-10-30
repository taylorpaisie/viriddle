import {darrenReports} from './darrenStory.ts';
import type {Case} from './model';
import {roomBookings,exposureWindows,outsideExposureChecks} from './evidenceDetails.ts';
// Offline fixture assembly only; connected play receives purchased reports from the server.
export function evidenceReports(c:Case){
 const reports:Record<string,any>={
  bookings:{title:'Room booking logs · attendance unverified',rows:roomBookings(c).map(r=>({label:r.date,text:`${r.description??"Shared workroom"} · booking for ${r.bookedFor} people.`})),note:'Planned room use does not establish attendance or transmission.'},
  windows:{title:'Incubation analysis · computed aid',rows:exposureWindows(c).map(r=>({label:r.name,text:`${r.start}–${r.end}`})),note:'Calculated from onset minus four days through onset minus one day; not new lab evidence.'},
  interviews:{title:'Patient interview transcripts',rows:c.patients.map(p=>({label:p.name,text:p.interview})),interviews:c.patients.map(p=>p.interview)},
  contacts:{title:'Documented interactions',rows:c.contacts.map(([a,b,d],i)=>({label:`${c.month} ${d}`,text:`${c.patients[a].name} ↔ ${c.patients[b].name}${c.contactDetails?.[i]?" · "+c.contactDetails[i]:""}`})),contacts:c.contacts,note:'Contact does not establish transmission direction.'},
  outside:{title:'Outside exposure checks · limited records',rows:outsideExposureChecks(c).map(r=>({label:r.name,text:(r.confirmed?'Record found: ':'')+r.details})),note:'Outside exposure alone is not source proof. Missing records cannot rule out exposures.'},
  genomics:{title:'Sequence comparison · SNP distance',rows:c.genomics.map(text=>({label:'Laboratory',text})),genomics:c.genomics,note:'Similar sequences support relatedness, but do not prove direct transmission.'}
 };
 if(c.evidenceOverrides)for(const [id,report] of Object.entries(c.evidenceOverrides))reports[id]={...reports[id],...report};
 if(c.incubationDays){reports.windows.rows=exposureWindows(c).map(r=>({label:r.name,text:`${r.start}–${r.end}`}));}
 return darrenReports(c,reports);
}
