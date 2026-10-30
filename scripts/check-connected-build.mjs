import {spawnSync} from 'node:child_process';
import {mkdtemp,readFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';import assert from 'node:assert/strict';
import {answerKeys} from '../src/answerKeys.ts';
const dir=await mkdtemp(join(tmpdir(),'outbreak-connected-'));
try{
 const r=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--outDir',dir,'--emptyOutDir'],{stdio:'inherit',env:{...process.env,VITE_SUPABASE_URL:'https://fixture.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_build_fixture'}});
 assert.equal(r.status,0,'Connected build failed');
 const assets=await readdir(join(dir,'assets'));const js=(await Promise.all(assets.filter(x=>x.endsWith('.js')).map(x=>readFile(join(dir,'assets',x),'utf8')))).join('\n');
 for(const key of Object.values(answerKeys))assert.ok(!js.includes(key.explanation),'An offline answer key leaked into the connected build');
 assert.ok(!js.includes('Returned from an outside-group gathering October 5.'),'Sealed offline interview leaked');
 assert.ok(!js.includes('Finley: lineage B'),'Sealed offline lab data leaked');
 for(const key of Object.values(answerKeys))for(const step of key.reveal??[])assert.ok(!js.includes(step.text),'Offline reconstruction leaked');
 assert.ok(!js.includes('Original accession entries verify specimens'),'Hospital sealed records leaked');
 assert.ok(!js.includes('Being first on this list does not tell you'),'Hospital interview leaked');
 assert.ok(!js.includes('They are twelve dollars each.'),'New sealed interview leaked');
 assert.ok(!js.includes('Office crisis meeting · 40 minutes together'),'New sealed encounter leaked');
 assert.ok(!js.includes('The Midnight Rehearsal'),'Offline case library leaked');
 console.log('PASS: connected production bundle excludes offline case library, sealed evidence, and all offline answer explanations.');
}finally{await rm(dir,{recursive:true,force:true})}
