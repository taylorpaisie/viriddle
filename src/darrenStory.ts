import type {Case,EvidenceReport} from './model';
// Fictional character comedy only: no dates, encounters, exposures or answers are added.
const stories:Record<string,[string,string]>={
 october:['Darren has convened a virus-naming tribunal because the festival’s fictional pathogen has a better publicity budget than Mothman. His proposed name is Sir Coughs-a-Lot.','“The virus has rejected my branding proposal. Its feedback was mostly replication.”'],
 harbor:['Darren has appointed a rubber duck to chair the harbor’s microbiology outreach panel. Its first ruling is that every virus diagram needs a tiny hat.','“The duck has excellent peer-review instincts. It rejected my paper without reading it.”'],
 glasshouse:['Darren has entered a plush bacterium in the glasshouse science fair. It has won best poster despite containing no data and very little stuffing.','“The bacterium’s error bars are decorative. We have disclosed this in the methods.”'],
 rehearsal:['Darren is staging a musical about viral replication. The chorus is thirty cardboard capsids, and he insists the encore must be exponential.','“The capsids want royalties. I offered them copies of themselves.”'],
 market:['Darren has opened a fictional bacterium naming booth at the science market. Every proposed name is a pun, and the taxonomy committee has stopped answering.','“Bacillus Dramaticus was rejected for excessive personality. I consider that an appealable decision.”'],
 lodge:['Darren has turned the lodge’s microbiology quiz into a formal trial over whether a virus counts as a terrible houseguest. The jury is six plush microbes.','“It uses the host’s resources and never helps with dishes. The analogy is impeccable.”'],
 museum:['Darren has made a wanted poster for a fictional bacterium in the museum’s microbe exhibition. The description reads: small, suspicious, probably dividing.','“The suspect has split into two suspects. I need a larger noticeboard.”'],
 signal:['Darren has proposed a late-night radio advice show for misunderstood viruses. The pilot episode is titled Please Stop Calling My Genome a Lifestyle Choice.','“The virus phoned in twice. I believe it was a duplication error.”'],
 riverside:['Darren is building a cardboard bacteriophage for the workshop’s science parade. He insists its tail fibers require their own dressing room.','“It infects bacteria. It does not need a human-sized backstage pass, but I respect its ambition.”'],
 'before-you-arrived':['With a press briefing minutes away, Darren slides his waiting-room game, Name That Pathogen, across the table. Infection prevention has flagged forty-seven errors. He closes the report before anyone finishes reading and asks, very softly, “Which version are we telling them?”','“The bacteria cannot collect rent. Fine. But removing the hand-hygiene square was clearly a mistake.”'],
 'duck-press':['Darren has appointed a rubber duck as the fictional virus’s press secretary. The duck refuses to confirm whether the capsid has retained counsel.','“All questions about the virus must go through the duck. It has advised me to stop calling the genome a press release.”'],
 'stapler-wedding':['Darren has written a bacterial wedding programme with an empty family tree. He is adding branches faster than the guests can read them.','“The bacteria have asked for a bigger family photo. They have already doubled the seating plan.”'],
 'moon-lawsuit':['Darren has called the PCR machine as a witness. Its only statement is an error message, which he has submitted as an expert opinion.','“The controls are valid. My lunar hypothesis is not. Please put that in a very small font.”']
};
export function darrenStory(c:Case){return stories[c.id]??['Darren has appointed a plush bacterium as the lab’s peer reviewer. It has demanded more replicates and its own swivel chair.','“The bacterium says the sample size is too small. It is currently solving that problem by dividing.”'];}
const append=(text:string,extra:string)=>text.includes(extra)?text:text+' '+extra;
export function withDarrenStory(c:Case):Case{
 if(!c.patients.some(p=>p.name==='Darren'))return c;
 const [setup,quote]=darrenStory(c);
 const brief=c.id==='before-you-arrived'?c.brief.replace('Darren has proposed a hospital waiting-room board game called Name That Pathogen. The infection-prevention team has returned it with forty-seven corrections.','').trim():c.brief;
 return {...c,brief:append(brief,setup),patients:c.patients.map(p=>p.name==='Darren'&&p.interview?{...p,interview:append(p.interview,'Personal aside (not exposure evidence): '+quote)}:p)};
}
export function darrenReports<T extends EvidenceReport>(c:Case,reports:Record<string,T>):Record<string,T>{
 if(!c.patients.some(p=>p.name==='Darren')||!reports.interviews)return reports;
 const extra='Personal aside (not exposure evidence): '+darrenStory(c)[1],interviews=reports.interviews as T&{interviews?:string[]};
 return {...reports,interviews:{...interviews,rows:interviews.rows.map(row=>row.label==='Darren'?{...row,text:append(row.text,extra)}:row),...(interviews.interviews?{interviews:interviews.interviews.map((text,i)=>c.patients[i]?.name==='Darren'?append(text,extra):text)}:{})}};
}
