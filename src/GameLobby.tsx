import {useState} from 'react';
import {ArrowRight,Search,Link2,Dna,FolderOpen,ChevronDown,Clock,Users,FlaskConical} from 'lucide-react';
import {utcDate,caseNumber} from './publicCase';
const clues=[
 {label:'Interview',icon:Search,title:'“I only stayed for one song.”',body:'The interview says 9 pm. The entry log says 7. Small details can change the story.',tag:'PATIENT INTERVIEW'},
 {label:'Contacts',icon:Link2,title:'Same room. Different stories.',body:'Two people crossed paths. A lead worth checking—not proof of who infected whom.',tag:'CONTACT RECORD'},
 {label:'Genomes',icon:Dna,title:'First sick. Wrong trail?',body:'An early patient has a different pathogen sequence. The first symptoms may belong to a separate outbreak.',tag:'SEQUENCE REPORT'}
];
export function GameLobby({play,learn,busy=false,label="Open today’s case"}:{play:()=>void;learn:()=>void;busy?:boolean;label?:string}){
 const [active,setActive]=useState(0);const clue=clues[active];const today=utcDate();
 return <section className="game-lobby" aria-labelledby="lobby-title">
  <div className="lobby-copy"><div className="lobby-kicker"><span/> YOUR DAILY OUTBREAK MYSTERY</div><h1 id="lobby-title">Something’s going <em>around.</em></h1><p className="lobby-hook">Six stories. One outbreak.<br/>A very satisfying <strong>“wait a minute…”</strong></p><div className="lobby-tagline">Every outbreak has a story. Can you trace it?</div>

  </div>
  <div className="lobby-case-wrap"><div className="lobby-folder-tab"><FolderOpen size={16}/> TODAY’S CASE <span>#{caseNumber(today)}</span></div><article className="lobby-case" aria-label="Today's daily case file"><div className="lobby-case-meta"><span>{new Date(today+'T12:00Z').toLocaleDateString(undefined,{month:'short',day:'numeric',timeZone:'UTC'})} · DAILY EDITION</span><span className="lobby-sealed">SEALED</span></div>
   <div className="lobby-case-art" aria-hidden="true"><div className="lobby-specimen-ring"/><svg viewBox="0 0 380 150"><path className="lobby-art-links" d="M45 43 146 29 235 100 335 37M45 43 95 118 235 100 330 123M146 29 330 123M335 37 330 123"/>{[[45,43],[146,29],[235,100],[335,37],[95,118],[330,123]].map(([x,y],i)=><g key={i} className={i===2?'lobby-art-focus':''}><rect x={x-19} y={y-20} width="38" height="40" rx="7"/><text x={x} y={y+5}>{i===2?'?':String(i+1).padStart(2,'0')}</text></g>)}</svg><span className="lobby-art-caption">PATIENT FILES · CONNECTIONS UNKNOWN</span></div>
   <h2>The evidence is sealed.<br/><span>Your move, detective.</span></h2><p className="lobby-case-description">Open the file. Follow the encounters.<br/>Find the story that fits.</p>
   <div className="lobby-rules"><span><Users size={17}/><b>6</b> patients</span><span><Clock size={17}/><b>5</b> min</span><span><b>100</b> pts max</span></div><button className="primary lobby-play" disabled={busy} onClick={play}><FolderOpen size={20}/>{busy?'Opening your case…':label}<ArrowRight size={20}/></button><div className="lobby-subactions"><span>No signup needed</span><button type="button" onClick={learn}>How to play <ArrowRight size={14}/></button></div>
  </article><div className="lobby-daily-note"><span/> Same mystery for everyone. Fresh at midnight UTC.</div></div>
   <details className="lobby-preview"><summary><FlaskConical size={18}/><span>Get a taste of the evidence</span><ChevronDown size={17}/></summary><div className="lobby-preview-body"><div className="lobby-clue-tabs" aria-label="Preview a clue">{clues.map((c,i)=><button key={c.label} type="button" aria-pressed={active===i} onClick={()=>setActive(i)}><c.icon size={16}/>{c.label}</button>)}</div><div className="lobby-clue" aria-live="polite" aria-atomic="true"><small>{clue.tag} · SAMPLE</small><h2>{clue.title}</h2><p>{clue.body}</p></div><small className="lobby-preview-note">Illustrative clues only. Today’s evidence stays sealed.</small></div></details>
 </section>;
}
export function LobbySteps(){return <div className="lobby-steps">{[[Search,'01','Everyone has a story.','Meet the patients. Check their symptoms and read between the lines.'],[Dna,'02','Buy your next “aha!”','Spend points on interviews, contacts and lab reports. Every clue is a choice.'],[Link2,'03','Make the call.','Connect the dates, confirm one hypothesis, then share your spoiler-free score.']].map(([Icon,n,title,body]:any)=><div key={n}><span className="lobby-step-icon"><Icon size={23}/><small>{n}</small></span><h3>{title}</h3><p>{body}</p></div>)}</div>}
