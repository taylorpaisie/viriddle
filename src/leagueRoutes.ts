// Hash routes keep GitHub Pages base paths and PKCE callback queries intact.
export type LeagueRoute={group?:string;invite?:string;invalidInvite?:boolean};
type Store=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export function leagueSessionStorage():Store{try{return window.sessionStorage}catch{return {getItem:()=>null,removeItem:()=>{},setItem:()=>{throw Error('Session storage unavailable')}};}}
export const pendingLeagueKey='virriddle-pending-league-v1';
const tokenPattern=/^[a-f0-9]{64}$/;
export function parseLeagueHash(hash:string):LeagueRoute|null{
 if(hash==='#friends')return {};
 if(hash.startsWith('#league-invite=')){const token=hash.slice(15);return tokenPattern.test(token)?{invite:token}:{invalidInvite:true};}
 if(/^#league=[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(hash))return {group:hash.slice(8).toLowerCase()};
 return null;
}
export function rememberLeagueInvite(storage:Store,token:string,now=Date.now()){
 if(!tokenPattern.test(token))return false;try{storage.setItem(pendingLeagueKey,JSON.stringify({token,at:now}));return true}catch{return false;}
}
export function clearLeagueInvite(storage:Store){try{storage.removeItem(pendingLeagueKey)}catch{}}
export function pendingLeagueInvite(storage:Store,now=Date.now()):string|null{
 try{const x=JSON.parse(storage.getItem(pendingLeagueKey)??'null');if(x&&typeof x.token==='string'&&tokenPattern.test(x.token)&&Number.isFinite(x.at)&&x.at<=now+60000&&now-x.at<=3600000)return x.token;}catch{}
 clearLeagueInvite(storage);return null;
}
export function initialLeagueRoute(hash:string,storage:Store,now=Date.now()):LeagueRoute|null{
 // An explicit result/auth/other route always wins over an older pending invite.
 const route=parseLeagueHash(hash);if(route)return route;if(hash)return null;
 const token=pendingLeagueInvite(storage,now);return token?{invite:token}:null;
}
export function leagueHash(route:LeagueRoute){return route.invite?'#league-invite='+route.invite:route.group?'#league='+route.group:'#friends';}
export function leagueInviteUrl(base:string,token:string){if(!tokenPattern.test(token))throw Error('Invalid invitation.');const u=new URL(base);u.search='';u.hash='league-invite='+token;return u.href;}
