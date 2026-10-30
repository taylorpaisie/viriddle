import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
const dir=await mkdtemp(process.cwd()+'/.league-test-');
try{
 await build({entryPoints:['src/Friends.tsx','src/leagueRoutes.ts'],outdir:dir,bundle:true,platform:'node',format:'esm',packages:'external',define:{'import.meta.env':JSON.stringify({BASE_URL:'/viriddle/',VITE_SUPABASE_URL:'',VITE_SUPABASE_PUBLISHABLE_KEY:''})}});
 const routes=await import(pathToFileURL(dir+'/leagueRoutes.js'));const {LeagueWorkspace}=await import(pathToFileURL(dir+'/Friends.js'));
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test/viriddle/?code=callback'});
 for(const key of ['window','document','location','sessionStorage','HTMLElement','Event','MouseEvent'])globalThis[key]=dom.window[key];
 Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const token='ab'.repeat(32),other='cd'.repeat(32),group='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 const store=dom.window.sessionStorage;store.setItem('unrelated-auth','preserved');
 assert.equal(routes.rememberLeagueInvite(store,token,100),true);assert.equal(routes.pendingLeagueInvite(store,101),token);
 assert.deepEqual(routes.initialLeagueRoute('',store,101),{invite:token});
 for(const hash of ['#result=scorecard','#access_token=auth','#unrelated'])assert.equal(routes.initialLeagueRoute(hash,store,101),null);
 assert.deepEqual(routes.parseLeagueHash('#friends'),{});assert.deepEqual(routes.parseLeagueHash('#league='+group),{group});assert.deepEqual(routes.parseLeagueHash('#league-invite='+token),{invite:token});assert.deepEqual(routes.parseLeagueHash('#league-invite=bad'),{invalidInvite:true});
 assert.equal(routes.leagueInviteUrl('https://example.test/viriddle/?code=private#result=old',token),'https://example.test/viriddle/#league-invite='+token);
 assert.equal(routes.leagueInviteUrl('https://example.test/',token),'https://example.test/#league-invite='+token);
 assert.throws(()=>routes.leagueInviteUrl('https://example.test/','bad'));
 assert.equal(routes.pendingLeagueInvite(store,3600101),null);assert.equal(store.getItem('unrelated-auth'),'preserved');
 store.setItem(routes.pendingLeagueKey,'broken');assert.equal(routes.pendingLeagueInvite(store),null);
 store.setItem(routes.pendingLeagueKey,JSON.stringify({at:Date.now()+1000000,token}));assert.equal(routes.pendingLeagueInvite(store),null);
 assert.equal(routes.rememberLeagueInvite({setItem(){throw Error('denied')}},token),false);
 const storageDescriptor=Object.getOwnPropertyDescriptor(window,'sessionStorage');Object.defineProperty(window,'sessionStorage',{configurable:true,get(){throw Error('blocked')}});assert.equal(routes.rememberLeagueInvite(routes.leagueSessionStorage(),token),false);assert.equal(routes.initialLeagueRoute('',routes.leagueSessionStorage()),null);Object.defineProperty(window,'sessionStorage',storageDescriptor);
 const ownerId='owner',memberId='member';let owner=false,expires=null;
 const rows=[{player_id:ownerId,display_name:'Alpha',is_me:false,points:null,solved:null,rank:null,status:'finished'},{player_id:memberId,display_name:'Beta',is_me:true,points:null,solved:null,rank:null,status:'not_started'}];
 const members=[{player_id:ownerId,display_name:'Alpha',is_me:false,is_owner:true,join_date:'2026-10-30'},{player_id:memberId,display_name:'Beta',is_me:true,is_owner:false,join_date:'2026-10-30'}];
 const board=scope=>({id:group,name:'Genome Gnomes',is_owner:owner,scope,start_date:scope==='today'?'2026-10-30':'2026-10-26',end_date:scope==='today'?'2026-10-30':'2026-11-01',today:'2026-10-30',today_unlocked:false,counted_through:'2026-10-29',rows:scope==='today'?rows:rows.map(r=>({...r,points:70,solved:1,rank:1,status:'weekly'})),members:members.map(m=>({...m,is_me:owner?m.is_owner:!m.is_owner})),invite_expires_at:expires});
 const calls=[];let googleCalls=0,guestCalls=0,navigations=[],lastRoute=null;
 const api=async(name,args={})=>{calls.push({name,args});if(name==='outbreak_league_preview')return {status:'available',name:'Genome Gnomes'};
 if(name==='outbreak_leagues')return [{id:group,name:'Genome Gnomes',is_owner:owner,members:2}];
 if(name==='outbreak_league_standings')return board(args.p_scope);
 if(name==='outbreak_league_join')return {ok:true,id:group};
 if(name==='outbreak_league_invite'){expires=args.p_action==='revoke'?null:'2026-11-06T12:00Z';return {ok:true,token:other,expires_at:expires};}
 if(name==='outbreak_save_profile')return {username:args.p_username};
 if(name==='outbreak_league_manage')return {ok:true,id:group};throw Error('Unexpected '+name);};
 let root=null,props;const base={route:{},navigate:r=>{navigations.push(r);lastRoute=r;},onPlay:()=>{calls.push({name:'play'})},linked:false,sessionReady:false,displayName:'Guest Sleuth',ensureGuest:async()=>{guestCalls++},accountBusy:false,google:async()=>{googleCalls++},api};
 async function mount(next={},fresh=false){if(fresh&&root){await act(async()=>root.unmount());root=null;}if(!root)root=createRoot(document.getElementById('app'));props={...base,...(fresh?{}:props),...next};await act(async()=>root.render(React.createElement(LeagueWorkspace,props)));}
 const text=()=>document.body.textContent;
 const button=(label)=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===label);
 const click=async(label)=>{const b=button(label);assert.ok(b,'Button '+label);assert.equal(b.disabled,false,'Enabled '+label);await act(async()=>b.click());};
 await mount({route:{invite:token}},true);assert.ok(text().includes('Genome Gnomes'));assert.ok(text().includes('Public leaderboard participation remains a separate opt-in'));assert.ok(button('Join league'));assert.equal(calls.filter(c=>c.name==='outbreak_league_join').length,0);
 await click('Save access with Google (optional)');assert.equal(googleCalls,1);assert.equal(routes.pendingLeagueInvite(store),token);assert.equal(calls.filter(c=>c.name==='outbreak_league_join').length,0);
 // Simulate the full redirect/reload boundary: no callback hash, same session storage, restored Google identity.
 const restored=routes.initialLeagueRoute('',store);await mount({route:restored,linked:true,sessionReady:true},true);assert.ok(button('Join league'));assert.equal(calls.filter(c=>c.name==='outbreak_league_join').length,0,'Never auto-join after Google');
 await click('Join league');assert.deepEqual(lastRoute,{group});assert.equal(routes.pendingLeagueInvite(store),null);assert.ok(text().includes('You joined the league'));
 // A fresh guest joins explicitly, establishes one anonymous session, and saves only a display name.
 await mount({route:{invite:token},linked:false,sessionReady:false},true);const beforeGuestJoins=calls.filter(c=>c.name==='outbreak_league_join').length;
 assert.ok(text().includes('Guest access stays in this browser'));assert.ok(document.querySelector('input[autocomplete="nickname"]'));await click('Join league');assert.ok(guestCalls>=1);assert.equal(calls.filter(c=>c.name==='outbreak_league_join').length,beforeGuestJoins+1);assert.deepEqual(calls.filter(c=>c.name==='outbreak_save_profile').at(-1).args,{p_username:'Guest Sleuth'});assert.deepEqual(lastRoute,{group});
 // Existing guests can read their league without Google. Missing display name blocks a new join.
 await mount({route:{group},linked:false,sessionReady:true},true);assert.ok(text().includes('Finish your official daily attempt'));assert.ok(button('Leave league'));
 await mount({route:{invite:token},linked:false,sessionReady:false,displayName:''},true);assert.equal(button('Join league').disabled,true);
 const beforeCollision=calls.filter(c=>c.name==='outbreak_league_join').length;await mount({route:{invite:token},api:async(name,args)=>{if(name==='outbreak_save_profile')throw Error('duplicate key violates players_username_unique');return api(name,args)}},true);await click('Join league');assert.ok(text().includes('That display name is taken'));assert.equal(calls.filter(c=>c.name==='outbreak_league_join').length,beforeCollision);
 // CAPTCHA is required only when creating a new browser identity, not for existing guests.
 await mount({route:{invite:token},captchaRequired:true,sessionReady:false},true);assert.equal(button('Join league').disabled,true);
 await mount({route:{invite:token},captchaRequired:true,sessionReady:true},true);assert.equal(button('Join league').disabled,false);
 // Failed anonymous setup does not save a name or redeem the invitation.
 const joinsBeforeFailure=calls.filter(c=>c.name==='outbreak_league_join').length;await mount({route:{invite:token},ensureGuest:async()=>{throw Error('Guest session unavailable')}},true);await click('Join league');assert.ok(text().includes('Guest session unavailable'));assert.equal(calls.filter(c=>c.name==='outbreak_league_join').length,joinsBeforeFailure);
 await mount({route:{},linked:false,sessionReady:false},true);assert.ok(text().includes('No Google sign-in required'));await click('Continue as Guest');
 await mount({route:{group},linked:true,sessionReady:true});assert.ok(text().includes('Finish your official daily attempt'));assert.ok(text().includes('Finished'));assert.ok(text().includes('Not played yet'));assert.equal(document.querySelectorAll('.league-me').length,1);assert.ok(!button('Delete league'));assert.ok(button('Leave league'));
 await click('This week');assert.ok(text().includes('Today is excluded'));assert.ok(text().includes('Oct 26, 2026'));assert.ok(text().includes('Nov 1, 2026'));assert.equal(document.querySelectorAll('.league-row[role="row"] strong').length,2);assert.equal(calls.at(-1).args.p_scope,'week');
 await click('Leave league');assert.ok(document.querySelector('[role="dialog"]'));await click('Cancel');assert.ok(!calls.some(c=>c.name==='outbreak_league_manage'&&c.args.p_action==='leave'));await click('Leave league');await click('Confirm');assert.ok(calls.some(c=>c.args.p_action==='leave'));assert.deepEqual(lastRoute,{});
 owner=true;await mount({route:{group},linked:true,sessionReady:true},true);assert.ok(text().includes('Owners must delete the league to leave'));assert.equal(button('Leave league'),undefined);
 assert.equal(document.querySelector('[aria-label="Remove Alpha"]'),null);assert.ok(document.querySelector('[aria-label="Remove Beta"]'));
 await click('Generate invitation');assert.ok(button('Copy link'));assert.ok(calls.some(c=>c.name==='outbreak_league_invite'));
 let copied='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async x=>{copied=x}}});await click('Copy link');assert.equal(copied,'https://example.test/viriddle/#league-invite='+other);assert.ok(text().includes('Invitation copied'));
 Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}});await click('Share invitation');assert.equal(document.querySelector('textarea').value,copied);
 const beforeRotate=calls.filter(c=>c.name==='outbreak_league_invite').length;await click('Regenerate invitation');assert.equal(calls.filter(c=>c.name==='outbreak_league_invite').length,beforeRotate);await click('Cancel');
 await act(async()=>document.querySelector('[aria-label="Remove Beta"]').click());await click('Confirm');assert.ok(calls.some(c=>c.args.p_action==='remove'&&c.args.p_member===memberId));
 await click('Delete league');assert.ok(text().includes('Official daily results stay'));await click('Confirm');assert.deepEqual(lastRoute,{});assert.ok(calls.some(c=>c.args.p_action==='delete'));
 await mount({route:{invite:token},linked:true,api:async()=>({status:'expired'})},true);assert.ok(text().includes('This invitation expired'));assert.equal(button('Join league'),undefined);
 await mount({route:{invalidInvite:true},api:async()=>{throw Error('Must not call preview for malformed link')}},true);assert.ok(text().includes('This invitation is incomplete'));
 await mount({route:{},linked:true,sessionReady:true,api:async()=>[]},true);assert.ok(text().includes('Create a league'));assert.ok(text().includes('Your crew’s first case board'));
 await mount({route:{group},linked:true,sessionReady:true,api:async()=>{throw Error('League unavailable')}},true);assert.ok(document.querySelector('[role="alert"]'));assert.ok(button('Try again'));await click('Play today');assert.equal(calls.at(-1).name,'play');
 let resolvePreview;await mount({route:{invite:token},api:()=>new Promise(r=>{resolvePreview=r})},true);assert.ok(text().includes('Checking invitation'));await act(async()=>resolvePreview({status:'unavailable'}));assert.ok(text().includes('no longer available'));
 await act(async()=>root.unmount());dom.window.close();
 console.log('PASS: base-path invitation URLs, callback/share-route isolation, pending invite TTL and sign-in return, explicit guest joining, display-name validation, CAPTCHA gating, failed guest setup, optional Google states, hidden Today results, UTC weekly labels, owner/member controls and confirmations, sharing/copy fallback, loading/empty/error/expired/deleted-link states, and daily-play navigation.');
}finally{await rm(dir,{recursive:true,force:true});}

