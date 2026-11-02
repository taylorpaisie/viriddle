import React from 'react';
import type {EvidenceReport} from './model';
import './phylogenetic-evidence.css';

import {lineageEvidence} from './phylogeny.ts';
export {lineageEvidence} from './phylogeny.ts';

export function PhylogeneticTree({groups}:{groups:ReturnType<typeof lineageEvidence>}){
 const titleId=React.useId(),descriptionId=React.useId();
 let nextY=38;
 const layout=groups.map(group=>{
  const tips=group.samples.map(name=>{const tip={name,y:nextY};nextY+=38;return tip});
  const y=(tips[0].y+tips[tips.length-1].y)/2;
  const result={...group,tips,y};nextY+=34;return result;
 });
 const height=nextY+4;
 return <figure className="phylo-tree"><svg viewBox={`0 0 560 ${height}`} role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
  <title id={titleId}>Sample phylogenetic tree · unresolved lineage relationships</title>
  <desc id={descriptionId}>{groups.map(group=>`${group.label}: ${group.samples.join(', ')}`).join('. ')}. Unrooted schematic. Within-lineage branching order is unresolved; branch lengths have no scale.</desc>
  {layout.length>1&&<line x1="28" y1={layout[0].y} x2="28" y2={layout[layout.length-1].y} className="phylo-backbone"/>}
  {layout.map(group=><g key={group.label}>
   {layout.length>1&&<line x1="28" y1={group.y} x2="190" y2={group.y}/>}
   <text x={layout.length>1?36:28} y={group.y-12} className="phylo-lineage-label">{group.label}</text>
   {group.tips.map(tip=><g key={tip.name}><path d={`M190 ${group.y} L310 ${tip.y} H340`}/><circle cx="340" cy={tip.y} r="3"/><text x="352" y={tip.y+5}>{tip.name}</text></g>)}
   <circle cx="190" cy={group.y} r="4"/>
  </g>)}
 </svg><figcaption>Unrooted schematic · branch lengths are not to scale. Samples fan from a shared node where branching order is unresolved. No transmission arrows are implied.</figcaption></figure>;
}

export function PhylogeneticEvidence({rows,patients=[],reveal=false}:{rows:EvidenceReport['rows'];patients?:string[];reveal?:boolean}){
 const groups=lineageEvidence(rows,patients);
 return <section className="phylogenetic-evidence" aria-label="Phylogenetic evidence">
  <div className="eyebrow">EVOLUTIONARY RELATEDNESS</div>
  <h3>The sample phylogenetic tree</h3>
  {groups.length>0?<PhylogeneticTree groups={groups}/>:<p>The report does not specify sample membership clearly enough to draw a corresponding tree.</p>}
  <p><strong>What supports the grouping?</strong> The laboratory’s reported sequence differences (SNPs). A phylogeny compares inherited sequence variation; symptom dates and contact lines describe different evidence.</p>
  <p><strong>What remains unresolved?</strong> These records do not include an alignment, a fitted evolutionary tree or branch-support estimates. Close sequences can share ancestry without proving direct transmission. Unsampled infections may connect the observed cases.</p>
  {reveal&&<p><strong>Apply it to the reconstruction.</strong> Use the reported lineages to assess which infections belong together, then check dates and exposure opportunities separately. A separate lineage does not identify the source of the other group. In hospital cases, dated archived samples can establish earlier circulation without identifying a donor.</p>}
 </section>;
}
