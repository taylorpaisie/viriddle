import type {Case,EvidenceReport} from './model';
import {refreshCaseCopy} from './caseCopy.ts';
// Fictional character comedy only: no dates, encounters, exposures or answers are added.
const legacyStories:Record<string,[string,string]>={
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
const stories:Record<string,[string,string]>={
  "october": [
    "Darren has drafted a statement describing the outbreak as “an unexpected engagement opportunity.” The committee has asked him to stop helping. He has requested that the request be put in writing.",
    "“I did not call it a successful event. I said the attendance figures were difficult to ignore.”"
  ],
  "harbor": [
    "Darren has put his own name on every speaking slot in the reunion programme. He calls it a formatting error. The file is named DARREN_FINAL_APPROVED.",
    "“The duplicate keynote was an accident. The encore keynote was a strategic decision.”"
  ],
  "glasshouse": [
    "Darren has submitted the same greenhouse poster to three prize categories under slightly different titles. Two judges are the same person. He has described this as a replication study.",
    "“Independent validation is important. Apparently it has to be independently written as well.”"
  ],
  "rehearsal": [
    "Darren has volunteered to give a two-minute microbiology introduction. His slide deck has forty-seven slides and an appendix titled Brief Additional Context. The director has begun timing him with a kitchen timer.",
    "“The introduction is only two minutes if you exclude definitions, acknowledgments and the introduction to the introduction.”"
  ],
  "market": [
    "Darren’s science-outreach stall has a professionally printed sign promising “99.9% fewer misconceptions.” The first correction arrived before opening. He wants to know whether the denominator can be changed.",
    "“The sign is technically a pilot result. I would prefer the reviewers not stand directly beside it.”"
  ],
  "lodge": [
    "Darren has circulated a retreat agenda with mandatory optional networking. When challenged, he added a footnote explaining that optional refers to the seating arrangement.",
    "“Attendance is voluntary. The attendance spreadsheet is merely very persuasive.”"
  ],
  "museum": [
    "Darren approved the museum’s microbe labels before checking the proofs. His own biography now says “resistant to most known antibiotics.” He has asked the curator whether the label can stay.",
    "“It was meant to say resistant to most known distractions. The first version has better audience engagement.”"
  ],
  "signal": [
    "Darren has recorded a public-health explanation, a clarification, and a clarification of the clarification. All three begin with “To keep this simple.” The producer has muted the preview channel.",
    "“The corrections are separate episodes. That is a programming decision, not an admission.”"
  ],
  "riverside": [
    "Darren has written a workshop risk assessment so long that the printer ran out of paper before reaching the signature page. He is calling the missing signature an equipment issue.",
    "“The document is comprehensive. I accept that page one should probably mention what the workshop actually does.”"
  ],
  "before-you-arrived": [
    "With a press briefing minutes away, Darren circulates a hospital statement marked FINAL. Infection prevention has flagged forty-seven corrections. He closes the report before anyone finishes reading and asks, very softly, “Which version are we telling them?”",
    "“I am not asking you to change the dates. I am asking whether they need to be on the first page.”"
  ],
  "duck-press": [
    "Darren has drafted the answer to every press question, including three nobody asked. The first answer refers readers to an attachment that does not exist.",
    "“We should avoid speculation. I have prepared a slide listing several preferred possibilities.”"
  ],
  "stapler-wedding": [
    "Darren approved four hundred conference badges containing his own name. He has proposed calling them commemorative editions rather than paying for a reprint.",
    "“Delegates can write their own names underneath. Networking benefits from a conversation starter.”"
  ],
  "moon-lawsuit": [
    "Darren’s apology for the failed open-day demonstration has forty-seven slides. Slide forty-six is titled In the Interest of Brevity. The department has requested a one-sentence email.",
    "“The sentence contains several semicolons. Nobody specified a punctuation limit.”"
  ]
};
export function darrenStory(c:Case){return stories[c.id]??['Darren has circulated a statement marked FOR INTERNAL USE, then complained that nobody is sharing it. He is preparing a statement about the statement.','“The communications plan is complete. We are still establishing who was supposed to read it.”'];}
const cleanFlavor=(text:string)=>{for(const [setup,quote] of Object.values(legacyStories)){text=text.replaceAll('Personal aside (not exposure evidence): '+quote,'').replaceAll(setup,'');}return text.replaceAll('Darren has proposed a hospital waiting-room board game called Name That Pathogen. The infection-prevention team has returned it with forty-seven corrections.','').replace(/\s{2,}/g,' ').trim();};

const append=(text:string,extra:string)=>text.includes(extra)?text:text+' '+extra;
export function withDarrenStory(c:Case):Case{
 c=refreshCaseCopy({...c,brief:cleanFlavor(c.brief)});
 if(!c.patients.some(p=>p.name==='Darren'))return c;
 const [setup,quote]=darrenStory(c);
 const brief=c.brief;
 return {...c,brief:append(brief,setup),patients:c.patients.map(p=>p.name==='Darren'&&p.interview?{...p,interview:append(cleanFlavor(p.interview),'Personal aside (not exposure evidence): '+quote)}:p)};
}
export function darrenReports<T extends EvidenceReport>(c:Case,reports:Record<string,T>):Record<string,T>{
 if(!c.patients.some(p=>p.name==='Darren')||!reports.interviews)return reports;
 const extra='Personal aside (not exposure evidence): '+darrenStory(c)[1],interviews=reports.interviews as T&{interviews?:string[]};
 return {...reports,interviews:{...interviews,rows:interviews.rows.map(row=>row.label==='Darren'?{...row,text:append(cleanFlavor(row.text),extra)}:row),...(interviews.interviews?{interviews:interviews.interviews.map((text,i)=>c.patients[i]?.name==='Darren'?append(cleanFlavor(text),extra):text)}:{})}};
}

