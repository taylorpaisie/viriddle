import React,{useEffect,useState} from 'react';
import {FlaskConical,FileText,ArrowRight} from 'lucide-react';
import {EvidenceRoom} from './gameComponents';
import {EvidenceGuide} from './EvidenceGuide';
import {InvestigationReports,type NotebookControls} from './InvestigationDesk';
import {evidence} from './catalog';
import type {Case,Run,EvidenceReport} from './model';
export function ClueLab({c,run,reports,notebook,unlock,busy=false,onBoard}:{c:Case;run:Run;reports:Record<string,EvidenceReport>;notebook:NotebookControls;unlock:(id:string)=>void|Promise<void>;busy?:boolean;onBoard:()=>void}){
 const [view,setView]=useState('shop'),[selected,setSelected]=useState(''),[pending,setPending]=useState<string|null>(null);
 const owned=evidence.filter(e=>run.unlocked.includes(e.id));
 useEffect(()=>{if(pending&&run.unlocked.includes(pending)){setSelected(pending);setView('reports');setPending(null);requestAnimationFrame(()=>document.querySelector('.clue-lab')?.scrollIntoView({block:'start',behavior:'instant'}));}},[pending,run.unlocked.join(',')]);
 function buy(id:string){setPending(id);Promise.resolve(unlock(id)).catch(()=>setPending(null))}
 const reportId=owned.some(e=>e.id===selected)?selected:owned[0]?.id;
 return <section className="clue-lab" aria-label="Clue lab"><div className="clue-view-tabs" role="group" aria-label="Evidence views"><button aria-pressed={view==='shop'} onClick={()=>setView('shop')}><FlaskConical size={18}/>Clue shop</button><button aria-pressed={view==='reports'} onClick={()=>setView('reports')}><FileText size={18}/>My reports <span>{owned.length}</span></button></div>{view==='shop'?<><p className="small muted clue-lab-note">Each clue costs points once. You can solve a case without buying every clue.</p><fieldset className="game-fieldset" disabled={busy}><EvidenceRoom run={run} unlock={buy}/></fieldset><EvidenceGuide c={c}/></>:<><p className="small muted clue-lab-note">Already paid for. Read, compare, and pin anything useful.</p>{!owned.length?<div className="panel empty-reports"><FileText size={27}/><h3>No reports yet.</h3><p>Choose a clue in the shop to reveal its evidence.</p><button className="secondary" onClick={()=>setView('shop')}>Browse clues <ArrowRight size={16}/></button></div>:<><div className="report-picker" role="group" aria-label="Choose an unlocked report">{owned.map(e=><button key={e.id} aria-pressed={reportId===e.id} onClick={()=>setSelected(e.id)}>{e.title}</button>)}</div><div aria-live="polite" className="report-open-status">{pending&&busy?'Opening your report…':''}</div>{reportId&&reports[reportId]?<InvestigationReports reports={{[reportId]:reports[reportId]}} unlocked={[reportId]} notebook={notebook}/>:<p role="status">Your report is loading. Please wait for the server response.</p>}<button className="secondary notebook-jump" onClick={onBoard}>Compare on the board <ArrowRight size={17}/></button></>}</>}</section>;
}
