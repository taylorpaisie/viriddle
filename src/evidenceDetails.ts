import type { Case } from './cases.ts';

// These corroborating fictional records are public clues, not answer keys.
const externalRecords:Record<string,Record<number,string>>={
 october:{0:'Illustration meetup, October 3: registration confirmed; another attendee later reported illness.',1:'Regional organizers’ gathering, October 5: attendance confirmed; an illness notice was sent afterward.'},
 harbor:{0:'Outside-group trip on September 30.',5:'Independent travel before October 2.'},
 glasshouse:{2:'Outside-group meeting on October 12.',5:'Independent travel before October 14.'},
 rehearsal:{3:'Touring production on November 3.',5:'Independent travel before November 5.'},
 market:{4:'Out-of-town exhibition on November 14.',5:'Independent travel before November 16.'},
 lodge:{4:'Independent travel before December 1.',5:'Outside-group lecture on December 1.'},
 museum:{0:'Outside-group conference on September 7.',5:'Independent travel before September 9.'},
 signal:{2:'Regional broadcast event on August 2.',5:'Independent travel before August 4.'},
 riverside:{1:'Outside-group art fair on April 16.',5:'Independent travel before April 18.'},
};
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
export const dayLabel=(c:Case,day:number)=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(2026,months.indexOf(c.month),day)));
export const exposureWindows=(c:Case)=>c.patients.map(p=>({name:p.name,start:dayLabel(c,p.onset-4),end:dayLabel(c,p.onset-1)}));
export const roomBookings=(c:Case)=>{
 const days=new Map<number,Set<number>>();
 for(const [a,b,day] of c.contacts){if(!days.has(day))days.set(day,new Set());days.get(day)!.add(a);days.get(day)!.add(b)}
 return [...days].sort(([a],[b])=>a-b).map(([day,people])=>({date:dayLabel(c,day),bookedFor:people.size,description:c.bookingDetails?.[day]}));
};
export const outsideExposureChecks=(c:Case)=>c.patients.map((p,i)=>({name:p.name,confirmed:externalRecords[c.id]?.[i]!==undefined,details:externalRecords[c.id]?.[i]??'No corroborated outside-group record in this limited check.'}));
