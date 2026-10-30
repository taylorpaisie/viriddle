import React,{useState} from 'react';
import {Home,FlaskConical,Users,MoreHorizontal,ArrowRight,BookOpen,Trophy,ChartNoAxesCombined,Info,ShieldCheck,Play,Menu} from 'lucide-react';
import {Logo} from './gameComponents';
import {AccountButton,Dialog} from './community';
import {ThemeToggle} from './ThemeToggle';

export function AppNavigation({page,navigate,signin,investigating=false,local=false}:{page:string;navigate:(page:string)=>void;signin:()=>void;investigating?:boolean;local?:boolean}){
 const [more,setMore]=useState(false);
 const items=[['home','Today',Home],['archive','Practice',FlaskConical],['friends','Friends',Users]] as const;
 function go(page:string){setMore(false);navigate(page)}
 const extra=[['how','How to play',BookOpen],['profile','My profile',Users],['stats','My statistics',ChartNoAxesCombined],['leaderboard','Leaderboard',Trophy],['about','About Viriddle',Info],['privacy','Privacy',ShieldCheck]] as const;
 return <><header className="app-header"><div className="nav-wrap"><button className="logo-button" aria-label="Viriddle home" onClick={()=>go('home')}><Logo/></button><nav className="desktop-navigation" aria-label="Main navigation">{items.map(([id,label,Icon])=><button key={id} aria-current={page===id?'page':undefined} className={page===id?'nav-active':''} onClick={()=>go(id)}><Icon size={17}/>{label}</button>)}<button onClick={()=>go('how')}>How to play</button></nav><ThemeToggle/><AccountButton open={signin} profile={()=>go('profile')}/><button className="more-menu-button" aria-label="More navigation" aria-expanded={more} onClick={()=>setMore(true)}><Menu size={21}/></button></div></header>{!investigating&&<nav className="app-bottom-navigation" aria-label="Main phone navigation">{items.map(([id,label,Icon])=><button key={id} aria-current={page===id?'page':undefined} onClick={()=>go(id)}><Icon size={21}/><span>{label}</span></button>)}<button aria-expanded={more} aria-current={!items.some(([id])=>id===page)?'page':undefined} onClick={()=>setMore(true)}><MoreHorizontal size={23}/><span>More</span></button></nav>}{more&&<Dialog title="Explore Viriddle" onClose={()=>setMore(false)}><div className="eyebrow">YOUR CASE DESK</div><h2>Where to, detective?</h2><div className="more-navigation">{[...items,...extra.filter(([id])=>local||id!=='stats')].map(([id,label,Icon])=><button key={id} onClick={()=>go(id)} aria-current={page===id?'page':undefined}><Icon size={21}/><span>{id==='profile'&&!local?'My stats & profile':label}</span><ArrowRight size={18}/></button>)}</div></Dialog>}</>;
}
export function ResumeInvestigation({title,remaining,relaxed,onResume}:{title:string;remaining:string;relaxed?:boolean;onResume:()=>void}){
 const ended=!relaxed&&remaining==='00:00';
 return <aside className="resume-investigation"><div><span className="eyebrow">{ended?'CASE READY TO REVIEW':'CASE IN PROGRESS'}</span><strong>{title}</strong><small>{relaxed?'Untimed practice':ended?'Time window ended. Open to review.':`${remaining} remaining · the clock keeps running`}</small></div><button className="primary" onClick={onResume}><Play size={17}/>{ended?'Review':'Resume'}</button></aside>;
}
