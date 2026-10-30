import React,{useEffect,useState} from 'react';
import {Moon,Sun} from 'lucide-react';

// Appearance is independent of player identity, attempts, and saved progress.
export const themeKey='viriddle-theme-v1';
type Theme='light'|'dark';
function currentTheme():Theme{return document.documentElement.dataset.theme==='light'?'light':'dark'}
export function ThemeToggle(){
 const [theme,setTheme]=useState<Theme>(currentTheme);
 useEffect(()=>{
  const media=window.matchMedia?.('(prefers-color-scheme: light)');
  function sync(){
   let saved:string|null=null;try{saved=localStorage.getItem(themeKey)}catch{}
   const next:Theme=saved==='light'||saved==='dark'?saved:media?.matches?'light':'dark';
   apply(next);
  }
  function apply(next:Theme){
   document.documentElement.dataset.theme=next;
   document.querySelector('meta[name="theme-color"]')?.setAttribute('content',next==='light'?'#F2F7FC':'#09121F');
   setTheme(next);
  }
  const storage=(event:StorageEvent)=>{if(event.key===themeKey||event.key===null)sync()};
  sync();media?.addEventListener('change',sync);window.addEventListener('storage',storage);
  return()=>{media?.removeEventListener('change',sync);window.removeEventListener('storage',storage)};
 },[]);
 function toggle(){
  const next:Theme=theme==='dark'?'light':'dark';
  try{localStorage.setItem(themeKey,next)}catch{}
  document.documentElement.dataset.theme=next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',next==='light'?'#F2F7FC':'#09121F');
  setTheme(next);
 }
 return <button className="theme-toggle" type="button" aria-label="Dark mode" aria-pressed={theme==='dark'} title={theme==='dark'?'Switch to light mode':'Switch to dark mode'} onClick={toggle}>{theme==='dark'?<Sun size={20}/>:<Moon size={20}/>}</button>;
}
