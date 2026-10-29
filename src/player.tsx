import React,{createContext,useContext,useEffect,useRef,useState} from 'react';
import {createClient,type Session} from '@supabase/supabase-js';
import type {Case,Solution} from './model';
export const backendConfigured=!!(import.meta.env.VITE_SUPABASE_URL&&import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
export const supabase=backendConfigured?createClient(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{flowType:'pkce',detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}}):null;
export type History={case_date:string;score:number;correct_solution:boolean;elapsed_seconds:number;evidence_used:string[];title?:string};
export type Stats={total:number;solved:number;points:number;average:number;best:number;average_time:number;best_time:number|null;success_rate:number;longest:number;current:number};
export const blankStats:Stats={total:0,solved:0,points:0,average:0,best:0,average_time:0,best_time:null,success_rate:0,longest:0,current:0};
export type Profile={player:{id:string;username:string;public_profile_enabled:boolean;tutorial_completed_at?:string};stats:Stats;history:History[]};
export type DailyState={case_id:string;case_date:string;number:string;case:Case;server_now:string;attempt:null|{id:string;status:string;started_at:string;duration_seconds:number;elapsed_seconds:number;evidence_used:string[];evidence_cost:number;selected_patient:number|null;score:number;correct_solution:boolean;base_points:number;speed_bonus:number};reports:Record<string,Report>;solution?:Solution};
export type Report={title:string;rows:{label:string;text:string}[];note?:string};
export async function rpc<T=any>(name:string,args:Record<string,unknown>={}):Promise<T>{if(!supabase)throw new Error('Online accounts are not configured yet. Local play is available.');const {data,error}=await supabase.rpc(name,args);if(error)throw new Error(error.message);return data as T;}
let guestRequest:Promise<Session>|null=null;
async function guestSession(captchaToken?:string){if(!supabase)throw new Error('Online accounts are not configured yet.');const {data}=await supabase.auth.getSession();if(data.session)return data.session;if(!guestRequest)guestRequest=(async()=>{try{const {data,error}=await supabase.auth.signInAnonymously(captchaToken?{options:{captchaToken}}:undefined);if(error)throw error;if(!data.session)throw new Error('Could not create a guest session.');return data.session}finally{guestRequest=null}})();return guestRequest;}
type PlayerContext={session:Session|null;profile:Profile|null;busy:boolean;error:string;setError:(s:string)=>void;ensureGuest:(captchaToken?:string)=>Promise<Session>;google:()=>Promise<void>;refresh:()=>Promise<void>;save:(name:string,pub:boolean)=>Promise<void>;completeTutorial:()=>Promise<void>;signOut:()=>Promise<void>};
const Context=createContext<PlayerContext>(null!);
export function PlayerProvider({children}:{children:React.ReactNode}){
 const[session,setSession]=useState<Session|null>(null),[profile,setProfile]=useState<Profile|null>(null),[busy,setBusy]=useState(backendConfigured),[error,setError]=useState('');const latest=useRef<string|null>(null);
 async function refresh(){if(!supabase)return;const {data}=await supabase.auth.getSession();if(!data.session)return;const uid=data.session.user.id;const p=await rpc<Profile>('outbreak_profile');if(latest.current===uid)setProfile(p);}
 useEffect(()=>{if(!supabase)return;let alive=true;const params=new URLSearchParams(location.search);if(params.has('error')){setError('Google could not link this identity. Your existing guest record has not been merged or overwritten. Try a different Google account, or keep playing as guest.');history.replaceState({},'',location.pathname);}
 supabase.auth.getSession().then(({data,error})=>{if(!alive)return;if(error)setError('Could not restore your sign-in. Please try again.');latest.current=data.session?.user.id??null;setSession(data.session);setBusy(false)});
 const {data:listener}=supabase.auth.onAuthStateChange((_event,s)=>{if(!alive)return;latest.current=s?.user.id??null;setSession(s);setProfile(null);setBusy(false)});return()=>{alive=false;listener.subscription.unsubscribe()};},[]);
 useEffect(()=>{if(!session)return;const expected=sessionStorage.getItem('outbreak-link-player');if(expected&&!session.user.is_anonymous){if(expected!==session.user.id){setError('This Google account belongs to a different player. Records were not merged. Your previous guest player ID is retained for support.');}else sessionStorage.removeItem('outbreak-link-player');}refresh().catch(e=>setError(e.message));},[session?.user.id,session?.user.is_anonymous]);
 async function ensureGuest(captchaToken?:string){const s=await guestSession(captchaToken);latest.current=s.user.id;setSession(s);return s;}
 async function google(){if(!supabase)throw new Error('Google sign-in is coming after the site’s account service is configured. You can play locally now.');setBusy(true);setError('');try{const redirectTo=new URL(import.meta.env.BASE_URL,location.origin).href;const {data}=await supabase.auth.getSession();if(data.session?.user.is_anonymous){sessionStorage.setItem('outbreak-link-player',data.session.user.id);const {error}=await supabase.auth.linkIdentity({provider:'google',options:{redirectTo}});if(error)throw error;}else {const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo}});if(error)throw error;}}catch(e){setBusy(false);throw new Error('Google sign-in could not start. No records were merged. '+(e as Error).message);}}
 async function save(name:string,pub:boolean){await rpc('outbreak_save_profile',{p_username:name,p_public:pub});await refresh();}
 async function completeTutorial(){try{localStorage.setItem('outbreak-tutorial-v1','done')}catch{}if(session){await rpc('outbreak_save_profile',{p_tutorial:true});await refresh();}}
 async function signOut(){if(!supabase)return;const {error}=await supabase.auth.signOut();if(error)throw error;setProfile(null);setSession(null);}
 return <Context.Provider value={{session,profile,busy,error,setError,ensureGuest,google,refresh,save,completeTutorial,signOut}}>{children}</Context.Provider>;
}
export const usePlayer=()=>useContext(Context);
export const ranks=[['Rookie Investigator',0],['Contact Tracer',3],['Field Epidemiologist',10],['Outbreak Investigator',25],['Senior Epidemiologist',50],['Chief Epidemiologist',100],['Outbreak Legend',365]] as const;
export const investigatorRank=(completed:number)=>[...ranks].reverse().find(r=>completed>=r[1])![0];
