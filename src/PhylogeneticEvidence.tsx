import React from 'react';
import type {EvidenceReport} from './model';
import './phylogenetic-evidence.css';

// Read only the supplied laboratory text. Never infer ancestry from contacts,
// symptom order, the answer key, or a handful of pairwise SNP distances.
export function lineageEvidence(rows:EvidenceReport['rows']){
 return rows.flatMap(row=>{
  const labels=[...row.text.matchAll(/\blineage ([A-Z])\b/g)].map(match=>match[1]);
  // A comparison may mention two lineages; its first label identifies the sample group.
  return labels.length?[{label:labels[0],text:row.text}]:[];
 }).filter((row,index,all)=>all.findIndex(other=>other.label===row.label)===index);
}

export function PhylogeneticEvidence({rows,reveal=false}:{rows:EvidenceReport['rows'];reveal?:boolean}){
 const groups=lineageEvidence(rows);
 return <section className="phylogenetic-evidence" aria-label="Phylogenetic evidence">
  <div className="eyebrow">EVOLUTIONARY RELATEDNESS</div>
  <h3>Read the lineages together.</h3>
  {groups.length>1?<figure><ul className="lineage-branches" aria-label="Reported sequence lineages">{groups.map(group=><li key={group.label}><strong>Lineage {group.label}</strong><p>{group.text}</p></li>)}</ul><figcaption>Schematic grouping of reported lineages. Branch lengths, root placement and relationships within each group are not inferred.</figcaption></figure>:<p>The supplied sequences support a related group. They do not resolve a branching order between patients.</p>}
  <p><strong>What supports the grouping?</strong> The laboratory’s reported sequence differences (SNPs). A phylogeny compares inherited sequence variation; symptom dates and contact lines describe different evidence.</p>
  <p><strong>What remains unresolved?</strong> These records do not include an alignment, a fitted evolutionary tree or branch-support estimates. Close sequences can share ancestry without proving direct transmission. Unsampled infections may connect the observed cases.</p>
  {reveal&&<p><strong>Apply it to the reconstruction.</strong> Use the reported lineages to assess which infections belong together, then check dates and exposure opportunities separately. A separate lineage does not identify the source of the other group. In hospital cases, dated archived samples can establish earlier circulation without identifying a donor.</p>}
 </section>;
}
