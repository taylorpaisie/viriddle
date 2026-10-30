// Owner-only fixture upload: this output contains answers. Never bundle or publish it.
import {practiceFixtures} from '../src/practiceFixtures.ts';
import {answerKeys} from '../src/answerKeys.ts';
import {formatCaseText} from '../src/cases.ts';
import {evidenceReports} from '../src/evidenceReports.ts';
const json=(x:unknown)=>"'"+JSON.stringify(x).replaceAll("'","''")+"'::jsonb";
console.log('begin;');
for(const [i,c] of practiceFixtures.entries()){
 const publicCase={...c,patients:c.patients.map(({interview,...p})=>({...p,interview:''})),contacts:[],genomics:[]};
 delete publicCase.evidenceOverrides;delete publicCase.nameMap;delete publicCase.contactDetails;delete publicCase.bookingDetails;
 const key=answerKeys[c.id],solution={...key,explanation:formatCaseText(c,key.explanation),reveal:key.reveal?.map(s=>({title:formatCaseText(c,s.title),text:formatCaseText(c,s.text)}))};
 const number=c.id==='before-you-arrived'?'LAB-01':'DEMO-'+String(i+1).padStart(2,'0');
 console.log(`insert into private.practice_cases(slug,number,public_data,solution,reports) values('${c.id}','${number}',${json(publicCase)},${json(solution)},${json(evidenceReports(c))}) on conflict(slug) do update set number=excluded.number,public_data=excluded.public_data,solution=excluded.solution,reports=excluded.reports;`);
}
console.log('commit;');
