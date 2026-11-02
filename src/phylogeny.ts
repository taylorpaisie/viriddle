import type {EvidenceReport} from './model';

// Membership comes only from the laboratory's explicit statements.
export function lineageEvidence(rows:EvidenceReport['rows'],patients:string[]=[]){
 const groups:{label:string;text:string;samples:string[]}[]=[];
 for(const row of rows)for(const clause of row.text.split(/[;.!]/)){
  const match=/\blineage ([A-Z])\b/.exec(clause);
  const all=/^All (six|three) (samples|sequences)\b/i.test(clause.trim());
  if(!match&&!all)continue;
  const prefix=match?clause.slice(0,match.index):clause;
  const assigned=new Set(groups.flatMap(group=>group.samples));
  const remaining=/\b(the )?other five\b/i.test(prefix);
  const samples=all?[...patients]:remaining?patients.filter(name=>!assigned.has(name)):patients.filter(name=>{
   const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
   return new RegExp('(^|[^\\p{L}\\p{N}_])'+escaped+'($|[^\\p{L}\\p{N}_])','u').test(prefix);
  });
  if(!samples.length)continue;
  const label=match?'Lineage '+match[1]:'Related sample group';
  if(!groups.some(group=>group.label===label))groups.push({label,text:row.text,samples});
 }
 return groups;
}

