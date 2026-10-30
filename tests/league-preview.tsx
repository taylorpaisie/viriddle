// Explicit local UI fixture. No network RPCs, authentication, official attempts or scores.
import React,{useState} from 'react';import {createRoot} from 'react-dom/client';
import {LeagueWorkspace} from '../src/Friends';
import type {LeagueRoute} from '../src/leagueRoutes';
import {Logo} from '../src/gameComponents';
import '../src/style.css';import '../src/neon-lab.css';import '../src/community.css';import '../src/playful-lab.css';import '../src/mobile.css';import '../src/investigation-desk.css';import '../src/case-closed.css';import '../src/game-lobby.css';import '../src/friends.css';
const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const members=[{player_id:'owner',display_name:'Captain Paisie',is_owner:true,is_me:true,join_date:'2026-10-26'},{player_id:'member',display_name:'Darren',is_owner:false,is_me:false,join_date:'2026-10-27'}];
async function api(name:string,args:Record<string,unknown>={}){
 if(name==='outbreak_leagues')return [{id,name:'The Genome Gnomes',is_owner:true,members:2}];
 if(name==='outbreak_league_standings')return {id,name:'The Genome Gnomes',is_owner:true,scope:args.p_scope,start_date:args.p_scope==='week'?'2026-10-26':'2026-10-30',end_date:args.p_scope==='week'?'2026-11-01':'2026-10-30',today:'2026-10-30',today_unlocked:false,counted_through:'2026-10-29',members,invite_expires_at:null,rows:members.map(m=>({...m,points:args.p_scope==='week'?140:null,solved:args.p_scope==='week'?2:null,rank:args.p_scope==='week'?1:null,status:m.is_me?'not_started':'finished'}))};
 if(name==='outbreak_league_preview')return {status:'available',name:'The Genome Gnomes'};
 if(name==='outbreak_league_invite')return {ok:true,token:'ab'.repeat(32),expires_at:'2026-11-06T12:00Z'};
 return {ok:true,id};
}
function Fixture(){const guest=new URLSearchParams(location.search).has('guest');const [ready,setReady]=useState(!guest);const [route,setRoute]=useState<LeagueRoute>(guest?{invite:'ab'.repeat(32)}:{group:id});return <><header><div className="nav-wrap"><Logo/><span className="muted" style={{fontSize:11,lineHeight:1.4}}>LOCAL FIXTURE</span></div></header><main><LeagueWorkspace route={route} navigate={setRoute} onPlay={()=>setRoute({})} linked={!guest} sessionReady={ready} displayName={guest?'':'Captain Paisie'} ensureGuest={async()=>{setReady(true)}} accountBusy={false} google={async()=>{}} api={api}/></main></>}
createRoot(document.getElementById('root')!).render(<Fixture/>);

