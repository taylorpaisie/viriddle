import React,{useEffect,useId,useRef,useState} from 'react';
import {rpc} from './player';

const choices=[['satisfying','Satisfying'],['confusing','Confusing'],['too_easy','Too easy'],['too_hard','Too hard']] as const;
type Rating=typeof choices[number][0];
type Reply={rating:Rating|null};
type Request=(name:string,args:Record<string,unknown>)=>Promise<Reply>;
function checked(reply:Reply){
 if(!reply||!(reply.rating===null||choices.some(([value])=>value===reply.rating)))throw new Error('Invalid feedback response');
 return reply.rating;
}

// Mounted only for finalized official daily attempts, keyed by player + attempt in ConnectedApp.
export function CaseFeedback({attemptId,request=rpc}:{attemptId:string;request?:Request}){
 const title=useId(),[rating,setRating]=useState<Rating|null>(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[loadError,setLoadError]=useState(false),[saveError,setSaveError]=useState(false),[saved,setSaved]=useState(false),[retry,setRetry]=useState(0);
 const generation=useRef(0),locked=useRef(false);
 useEffect(()=>{
  const version=++generation.current;locked.current=false;
  setRating(null);setLoading(true);setSaving(false);setLoadError(false);setSaveError(false);setSaved(false);
  request('outbreak_case_feedback',{p_attempt_id:attemptId}).then(reply=>{
   const value=checked(reply);if(generation.current===version)setRating(value);
  }).catch(()=>{if(generation.current===version)setLoadError(true)}).finally(()=>{if(generation.current===version)setLoading(false)});
  return()=>{generation.current++};
 },[attemptId,request,retry]);
 async function choose(value:Rating){
  if(locked.current||loading||loadError||rating===value)return;
  locked.current=true;const version=generation.current;setSaving(true);setSaveError(false);setSaved(false);
  try{
   const result=checked(await request('outbreak_case_feedback',{p_attempt_id:attemptId,p_rating:value}));
   if(result!==value)throw new Error('Feedback was not saved');
   if(generation.current===version){setRating(result);setSaved(true)}
  }catch{if(generation.current===version)setSaveError(true)}
  finally{if(generation.current===version){locked.current=false;setSaving(false)}}
 }
 return <section className="panel case-feedback" aria-labelledby={title} aria-busy={loading||saving}>
  <div><div className="eyebrow">HELP SHAPE THE NEXT MYSTERY</div><h2 id={title}>How was this case?</h2><p className="small muted">Optional · Choose the closest fit. Your rating helps improve the puzzles and never changes your score.</p></div>
  <div className="feedback-choices" role="group" aria-labelledby={title}>{choices.map(([value,label])=><button type="button" className="secondary" key={value} aria-pressed={rating===value} disabled={loading||saving||loadError} onClick={()=>choose(value)}>{label}</button>)}</div>
  {loadError?<div className="feedback-error"><p role="alert">Feedback is unavailable right now. You can keep exploring your results.</p><button type="button" className="text-button" onClick={()=>setRetry(n=>n+1)}>Try again</button></div>:saveError?<p role="alert" className="feedback-error">Couldn’t save that rating. Choose an option to try again.</p>:<p className="small feedback-status" role="status">{loading?'Loading your rating…':saving?'Saving your rating…':saved?'Thanks—your feedback is saved. You can change it.':rating?'Your previous rating is selected. You can change it.':'One rating per daily attempt. Shared privately with the creator.'}</p>}
 </section>;
}
