import type {Case,Run,Solution} from './model';
import {formatCaseText,hypothesisLabel} from './publicCase.ts';
import {clockText} from './gameRules.ts';
export function shareResult({run,number,streak,mode,url}:{run:Run;number:string;streak:number;mode:string;url:string}){
 const r=run.result;if(!r)throw Error('Results are available only after a case closes.');
 const total=r.evidenceTotal??3,used=Math.min(run.unlocked.length,total);
 const tiles='🟪'.repeat(used)+'⬛'.repeat(total-used);
 const verdict=r.timedOut?'⏱️ Out of time':r.correct?'🟩 Solved':'🟥 Unsolved';
 const time=run.relaxed?'Untimed':r.elapsedSeconds!==undefined?clockText(r.elapsedSeconds*1000):null;
 return [`Virriddle #${number} 🦠${mode==='daily'?'':' · PRACTICE'}`,`${verdict} · ${r.score}/100`,`🔬 ${tiles} ${used}/${total}`,time?`⏱️ ${time}`:null,mode==='daily'?`🔥 ${streak} day${streak===1?'':'s'} streak`:'Practice · no daily score changes','','Can you trace it?',url].filter(line=>line!==null).join('\n');
}
export function deductionSteps(c:Case,solution:Solution):{title:string;text:string}[]{
 if(solution.reveal&&solution.reveal.length>=3)return [solution.reveal[0],solution.reveal[1],solution.reveal.at(-1)!].map(s=>({title:formatCaseText(c,s.title),text:formatCaseText(c,s.text)}));
 if(solution.outcome==='unresolved'||c.hypotheses)return [{title:'The supported explanation',text:hypothesisLabel(c,solution.source)},{title:'What the evidence supports',text:formatCaseText(c,solution.explanation)},{title:'Keep the limits in view',text:'Related sequences do not establish a direct donor, direction or intent. An individual source may remain unresolved.'}];
 const source=c.patients[solution.source],cluster=new Set(solution.tree.flat()),outside=c.patients.find((_,i)=>!cluster.has(i)&&i!==solution.source);
 return [{title:'Start inside the cluster',text:`${source.name} developed symptoms ${c.month} ${source.onset}. In the intended simulation, this patient starts the connected cluster. The earliest illness across all six records is not necessarily its source.`},{title:'Follow the simulated links',text:solution.tree.map(([a,b])=>`${c.patients[a].name} → ${c.patients[b].name}`).join(' · ')+'. These arrows describe the fictional reconstruction; contact and genetic similarity alone do not prove them.'},{title:outside?'Check the separate introduction':'Keep the limits in view',text:outside?`${outside.name} belongs to a separate introduction in this simulation. Including an unrelated early infection would give the cluster the wrong starting point.`:'Combine timelines, contacts and laboratory findings. A real investigation can have multiple plausible histories.'}];
}
