import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';

const dir=await mkdtemp(process.cwd()+'/.feedback-test-');
try{
 await build({entryPoints:['src/CaseFeedback.tsx'],outfile:dir+'/ui.mjs',bundle:true,platform:'node',format:'esm',packages:'external',define:{'import.meta.env':JSON.stringify({BASE_URL:'/viriddle/',VITE_SUPABASE_URL:'',VITE_SUPABASE_PUBLISHABLE_KEY:''})}});
 const {CaseFeedback}=await import(pathToFileURL(dir+'/ui.mjs'));
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test/viriddle/'});
 for(const k of ['window','document','HTMLElement'])globalThis[k]=dom.window[k];
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const root=createRoot(document.getElementById('app')),calls=[];
 let replies=[];
 const request=(name,args)=>{calls.push({name,args});return new Promise((resolve,reject)=>replies.push({resolve,reject}))};
 const button=text=>[...document.querySelectorAll('button')].find(b=>b.textContent===text);
 const mount=(key='guest:one',attemptId='one')=>act(async()=>root.render(React.createElement(CaseFeedback,{key,attemptId,request})));
 const resolve=async reply=>act(async()=>replies.shift().resolve(reply));
 const reject=async()=>act(async()=>replies.shift().reject(new Error('network')));
 const click=async text=>act(async()=>button(text).click());
 await mount();assert.equal(calls.length,1);assert.equal(calls[0].args.p_rating,undefined);assert.ok(button('Satisfying').disabled);
 await resolve({rating:null});assert.equal(calls.length,1,'No rating is sent by merely viewing results');
 assert.equal(button('Satisfying').getAttribute('aria-pressed'),'false');assert.equal(button('Satisfying').type,'button');
 await act(async()=>{button('Satisfying').click();button('Confusing').click()});assert.equal(calls.length,2,'Only one save in flight');assert.deepEqual(calls[1].args,{p_attempt_id:'one',p_rating:'satisfying'});
 assert.ok(button('Too hard').disabled);assert.ok(!document.body.textContent.includes('feedback is saved'));
 await resolve({rating:'satisfying'});assert.equal(button('Satisfying').getAttribute('aria-pressed'),'true');assert.ok(document.querySelector('[role=status]').textContent.includes('saved'));
 await click('Confusing');await reject();assert.ok(document.querySelector('[role=alert]'));assert.equal(button('Satisfying').getAttribute('aria-pressed'),'true','Failed write keeps saved rating');assert.equal(button('Confusing').getAttribute('aria-pressed'),'false');
 await click('Confusing');await resolve({rating:'confusing'});assert.equal(button('Confusing').getAttribute('aria-pressed'),'true');
 await mount('guest:reload');await resolve({rating:'confusing'});assert.equal(button('Confusing').getAttribute('aria-pressed'),'true','Saved rating restored');
 await mount('other:two','two');await reject();assert.ok(button('Too easy').disabled);await click('Try again');await resolve({rating:null});assert.ok(!button('Too easy').disabled);
 // Ignore stale saves when the player or case changes.
 await click('Too easy');await mount('third:three','three');await resolve({rating:'too_easy'});assert.equal(button('Too easy').getAttribute('aria-pressed'),'false');assert.ok(button('Too easy').disabled);
 await resolve({rating:'too_hard'});assert.equal(button('Too hard').getAttribute('aria-pressed'),'true');
 await click('Satisfying');await resolve({rating:null});assert.ok(document.querySelector('[role=alert]'),'A non-confirming reply must not claim success');
 await act(async()=>root.unmount());
 console.log('PASS: optional no-write-on-view, saved-state restore, retry, nonoptimistic saves, error recovery, duplicate-click lock, stale account/case isolation, accessible button states.');
}finally{await rm(dir,{recursive:true,force:true})}
