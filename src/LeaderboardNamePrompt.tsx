import {useEffect,useState,type FormEvent} from 'react';
import {usePlayer} from './player';
import {nameError,nameHelp} from './leaderboardNames';
export function LeaderboardNamePrompt(){
 const p=usePlayer();
 const [name,setName]=useState(''),[pub,setPub]=useState(false),[hidden,setHidden]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState('');
 useEffect(()=>{setHidden(false);setPub(false);setError('')},[p.session?.user.id]);
 useEffect(()=>{setName(p.profile?.player.username_chosen?p.profile.player.username:'')},[p.profile?.player.username_chosen,p.profile?.player.username]);
 if(!p.profile||hidden||p.profile.player.public_profile_enabled)return null;
 async function submit(e:FormEvent){e.preventDefault();const invalid=nameError(name);if(invalid){setError(invalid);return}setSaving(true);setError('');try{await p.save(name.trim(),pub);setHidden(true)}catch(e){setError((e as Error).message)}finally{setSaving(false)}}
 return <aside className="panel guest-prompt"><h2>Choose a name for the leaderboard.</h2><p>Your score is saved. Choose a public name whenever you are ready.</p><form onSubmit={submit}><label>Display name<input required minLength={3} maxLength={20} autoComplete="nickname" value={name} onChange={e=>setName(e.target.value)} aria-describedby="leaderboard-name-help"/></label><p id="leaderboard-name-help" className="small muted">{nameHelp} This name will be public if you opt in. You do not need to use your real name.</p><label className="check-label"><input type="checkbox" checked={pub} onChange={e=>setPub(e.target.checked)}/>Show my name and scores on the public leaderboard.</label>{error&&<p role="alert" className="error-message">{error}</p>}<button className="primary" disabled={saving}>{saving?'Saving…':'Save name'}</button><button type="button" className="text-button" disabled={saving} onClick={()=>setHidden(true)}>Maybe later</button></form></aside>;
}
