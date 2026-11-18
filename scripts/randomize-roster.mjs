// Owner-only. Shuffle the complete sealed snapshot, never the browser's roster alone.
import assert from 'node:assert/strict';
import {randomInt} from 'node:crypto';
export function randomizeRoster(entry,order){
 assert.ok(!entry.case.hypotheses&&entry.solution.outcome!=='unresolved','Explanation-choice cases require their own ordering policy');
 const n=entry.case.patients.length,suppliedOrder=order!==undefined;
 order=order?[...order]:Array.from({length:n},(_,i)=>i);
 if(!suppliedOrder)for(let i=n-1;i>0;i--){const j=randomInt(i+1);[order[i],order[j]]=[order[j],order[i]];}
 assert.equal(order.length,n);assert.equal(new Set(order).size,n);assert.ok(order.every(i=>Number.isInteger(i)&&i>=0&&i<n),'A complete permutation is required');
 const inverse=[];order.forEach((old,index)=>inverse[old]=index);
 const result=structuredClone(entry),c=result.case,r=result.reports,s=result.solution;
 const reorder=items=>{assert.equal(items.length,n);return order.map(i=>items[i]);};
 const edges=items=>items.map(([a,b,...rest])=>[inverse[a],inverse[b],...rest]);
 c.patients=reorder(c.patients);c.contacts=edges(c.contacts);
 s.source=inverse[s.source];s.tree=edges(s.tree);
 for(const key of ['interviews','windows','outside'])if(r[key]){
  assert.deepEqual(r[key].rows.map(row=>row.label),entry.case.patients.map(p=>p.name),'Patient report order is inconsistent');
  r[key].rows=reorder(r[key].rows);
 }
 if(r.interviews?.interviews)r.interviews.interviews=reorder(r.interviews.interviews);
 if(r.contacts?.contacts)r.contacts.contacts=edges(r.contacts.contacts);
 if(r.genomics?.rows.length===n+1){
  assert.ok(r.genomics.rows.slice(1).every((row,i)=>row.text.startsWith(entry.case.patients[i].name+':')),'Matrix rows must identify their patients');
  r.genomics.rows=[r.genomics.rows[0],...order.map(i=>r.genomics.rows[i+1])];
  if(r.genomics.genomics)r.genomics.genomics=r.genomics.rows.map(row=>row.text);
 }
 if(result.audit){
  result.audit.cluster=result.audit.cluster.map(i=>inverse[i]);
  result.audit.separate=Array.isArray(result.audit.separate)?result.audit.separate.map(i=>inverse[i]):inverse[result.audit.separate];
  result.audit.snpMatrix=order.map(i=>order.map(j=>entry.audit.snpMatrix[i][j]));
 }
 return result;
}
