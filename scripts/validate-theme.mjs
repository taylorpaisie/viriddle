import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
const dir=await mkdtemp(process.cwd()+'/.theme-test-');
try{
 await build({entryPoints:['src/ThemeToggle.tsx'],outfile:dir+'/theme.mjs',bundle:true,platform:'node',format:'esm',packages:'external'});
 const {ThemeToggle,themeKey}=await import(pathToFileURL(dir+'/theme.mjs'));
 const html=await readFile('index.html','utf8');
 const init=html.match(/<script id="theme-init">([\s\S]*?)<\/script>/)[1];
 const dom=new JSDOM('<meta name="theme-color"><div id="app"></div>',{url:'https://example.test/viriddle/',runScripts:'outside-only'});
 for(const key of ['window','document','localStorage','HTMLElement','Event','MouseEvent'])globalThis[key]=dom.window[key];
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 let prefersLight=true,systemListener;
 window.matchMedia=()=>({get matches(){return prefersLight},addEventListener(_,fn){systemListener=fn},removeEventListener(){systemListener=undefined}});
 window.eval(init);assert.equal(document.documentElement.dataset.theme,'light','First visit follows system before React renders');
 localStorage.setItem(themeKey,'dark');window.eval(init);assert.equal(document.documentElement.dataset.theme,'dark','Saved choice wins before paint');
 assert.equal(document.querySelector('meta').content,'#09121F');
 localStorage.setItem('outbreak-progress','keep');localStorage.setItem('virriddle-pending-league-v1','keep');
 let root=createRoot(document.getElementById('app'));
 await act(async()=>root.render(React.createElement(ThemeToggle)));
 const button=()=>document.querySelector('button');
 assert.equal(button().getAttribute('aria-pressed'),'true');
 await act(async()=>button().click());
 assert.equal(document.documentElement.dataset.theme,'light');assert.equal(localStorage.getItem(themeKey),'light');assert.equal(document.querySelector('meta').content,'#F2F7FC');
 assert.equal(button().getAttribute('title'),'Switch to dark mode');
 assert.equal(button().getAttribute('aria-pressed'),'false');
 await act(async()=>root.unmount());window.eval(init);
 root=createRoot(document.getElementById('app'));await act(async()=>root.render(React.createElement(ThemeToggle)));
 assert.equal(document.documentElement.dataset.theme,'light','Choice survives remount/reload');
 localStorage.setItem(themeKey,'dark');await act(async()=>window.dispatchEvent(new window.StorageEvent('storage',{key:themeKey})));
 assert.equal(button().getAttribute('aria-pressed'),'true','Other tabs synchronize');
 localStorage.removeItem(themeKey);prefersLight=false;await act(async()=>systemListener());assert.equal(document.documentElement.dataset.theme,'dark');
 prefersLight=true;await act(async()=>systemListener());assert.equal(document.documentElement.dataset.theme,'light');
 localStorage.setItem(themeKey,'invalid');window.eval(init);assert.equal(document.documentElement.dataset.theme,'light','Invalid preference uses system');
 assert.equal(localStorage.getItem('outbreak-progress'),'keep');assert.equal(localStorage.getItem('virriddle-pending-league-v1'),'keep');
 await act(async()=>root.unmount());
 const descriptor=Object.getOwnPropertyDescriptor(window,'localStorage');Object.defineProperty(window,'localStorage',{configurable:true,get(){throw Error('blocked')}});
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw Error('blocked')}});
 window.eval(init);root=createRoot(document.getElementById('app'));await act(async()=>root.render(React.createElement(ThemeToggle)));await act(async()=>button().click());assert.equal(document.documentElement.dataset.theme,'dark','Switch still works when browser storage is blocked');await act(async()=>root.unmount());
 Object.defineProperty(window,'localStorage',descriptor);
 // WCAG AA checks for the primary reading and action pairs in both palettes.
 const luminance=hex=>{const c=hex.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722};
 const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
 for(const [name,file,pattern] of [['dark','src/neon-lab.css',/:root\s*\{([^}]+)\}/],['light','src/themes.css',/:root\[data-theme="light"\]\s*\{([^}]+)\}/]]){
  const css=(await readFile(file,'utf8')).match(pattern)[1];const colors=Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/ig)].map(m=>[m[1],m[2]]));
  for(const ink of ['text','text-secondary','primary','secondary','success','warning','error'])for(const bg of ['background','surface'])assert.ok(ratio(colors[ink],colors[bg])>=4.5,`${name}: ${ink} on ${bg} needs AA contrast`);
  assert.ok(ratio(colors.primary,name==='light'?'#FFFFFF':'#09121F')>=4.5);
 }
 console.log('Theme initialization, switching, persistence, cross-tab sync, storage fallback, progress isolation, and AA palette contrast passed.');
}finally{await rm(dir,{recursive:true,force:true})}
