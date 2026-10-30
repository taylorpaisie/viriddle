// Offline owner tool. Generated SQL contains secrets: never put it in dist or public assets.
import {caseFor,formatCaseText} from '../src/cases.ts';
import {answerKeys} from '../src/answerKeys.ts';
import {evidenceReports} from '../src/evidenceReports.ts';
const start=process.argv[2],count=Number(process.argv[3]??30);
if(!/^\d{4}-\d{2}-\d{2}$/.test(start??'')||!Number.isInteger(count)||count<1||count>366)throw Error('Usage: npm run cases:sql -- YYYY-MM-DD [1..366]');
const literal=(x:unknown)=>"'"+JSON.stringify(x).replaceAll("'","''")+"'::jsonb";
console.log('-- PRIVATE: sample case fixtures. For staging; repeated public templates are not suitable for competitive launch.\nbegin;');
for(let i=0;i<count;i++){
 const date=new Date(Date.parse(start+'T12:00Z')+i*86400000).toISOString().slice(0,10),c=caseFor(date),key=answerKeys[c.id];
 const publicCase={...c,patients:c.patients.map(({interview,...p})=>({...p,interview:''})),contacts:[],genomics:[]};delete publicCase.evidenceOverrides;delete publicCase.nameMap;delete publicCase.contactDetails;delete publicCase.bookingDetails;
 const reports=evidenceReports(c);
 const solution={...key,explanation:formatCaseText(c,key.explanation),reveal:key.reveal?.map(step=>({title:formatCaseText(c,step.title),text:formatCaseText(c,step.text)}))};
 console.log(`with c as (insert into public.daily_cases(case_date,published_at,public_data) values ('${date}','${date}T00:00:00Z',${literal(publicCase)}) on conflict(case_date) do nothing returning id) insert into private.case_secrets(case_id,solution,reports) select id,${literal(solution)},${literal(reports)} from c;`);
}
console.log('commit;');
