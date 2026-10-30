import type {Case,Solution} from './model';
// Offline authoring fixtures only. Connected play receives these through curated practice RPCs.
// Stable slugs retain existing practice links; titles and scenery are refreshed.
const themes=[
  {
    "id": "duck-press",
    "title": "The Emergency Press Briefing",
    "place": "MICROBIOLOGY OUTREACH PRESS ROOM",
    "pathogen": "Asterovirus · fictional respiratory virus",
    "roles": [
      "Outreach scientist and reluctant spokesperson",
      "Public-health communications officer",
      "Research assistant"
    ],
    "intro": "A fictional respiratory virus has made three outreach volunteers ill. Darren has scheduled a reassuring press briefing before anyone has agreed on what can be said. Carla has found an unsent correction in the draft. Lucy has found three contradictory versions of the same slide. Trace the human contacts before a confident announcement outruns the evidence.",
    "source": 0,
    "encounters": [
      "Darren and Carla rehearse the health briefing together in the office.",
      "Carla and Lucy edit the incubation-period poster together in the office."
    ]
  },
  {
    "id": "stapler-wedding",
    "title": "The Conference Welcome-Pack Crisis",
    "place": "MICROBIOLOGY CONFERENCE · PREPARATION ROOM",
    "pathogen": "Cohortobacter respirans · fictional respiratory bacterium",
    "roles": [
      "Conference organizer and badge-printing enthusiast",
      "Welcome-pack coordinator",
      "Volunteer programme editor"
    ],
    "intro": "The microbiology conference opens tomorrow. Four hundred badges have the same name, the welcome bags contain last year’s programme, and three organizers are ill with a fictional respiratory bacterium. Darren has proposed fixing the badges with a marker and charging the sponsor for a live personalization experience. The printing disaster is background: use the dated respiratory contacts to trace the cluster.",
    "source": 1,
    "encounters": [
      "Carla and Darren prepare conference packs together at the workroom table.",
      "Darren and Lucy correct the conference programme together at the workroom table."
    ]
  },
  {
    "id": "moon-lawsuit",
    "title": "The Forty-Seven-Slide Apology",
    "place": "VIROLOGY OPEN DAY · BRIEFING OFFICE",
    "pathogen": "Orlovirus · fictional respiratory virus",
    "roles": [
      "Open-day scientist with an overlong apology",
      "Laboratory open-day coordinator",
      "Viral-genomics demonstrator"
    ],
    "intro": "The virology open-day demonstration has failed in front of a donor. Darren has prepared an apology that requires a projector, an intermission and a glossary. Meanwhile, three volunteers develop illness from a fictional respiratory virus. The equipment error does not establish an exposure route. Follow their documented human encounters rather than the loudest explanation in the room.",
    "source": 2,
    "encounters": [
      "Lucy and Carla prepare the viral-genomics exhibit together in the office.",
      "Carla and Darren rehearse the virology demonstration together in the office."
    ]
  }
];
export const simpleExamples:Case[]=themes.map(t=>{
 const order=t.source===0?[0,1,2]:t.source===1?[1,0,2]:[2,1,0];
 const onset=Object.fromEntries(order.map((p,i)=>[p,4+i*3]));
 const contacts:[number,number,number][]=[[order[0],order[1],5],[order[1],order[2],8]];
 const patients=['Darren','Carla','Lucy'].map((name,i)=>({name,onset:onset[i],role:t.roles[i],interview:i===order[0]?`I felt ill May 4 after an outside conference May 1. ${t.encounters[0]} That meeting was May 5. I had no meeting with ${['Darren','Carla','Lucy'][order[2]]}.` : i===order[1]?`${t.encounters[0]} That was May 5. I felt ill May 7. ${t.encounters[1]} That was May 8.`:`${t.encounters[1]} That was May 8. I felt ill May 10. I had no earlier meeting with either of them.`}));
 return {id:t.id,title:t.title,place:t.place,month:'May',pathogen:t.pathogen,incubation:'1–4 days',practice_available:true,objective:'Find the source of this three-person fictional cluster.',brief:t.intro+' Easy mode: three patients, two reported encounters, one intended source.',interviewNote:'Symptoms appear 1–4 days after infection. Infectiousness starts at symptom onset. These simplified rules apply only to the invented pathogen in this teaching case. All relevant encounters are listed.',patients,contacts,contactDetails:t.encounters,bookingDetails:{5:t.encounters[0],8:t.encounters[1]},genomics:['All three sequences belong to lineage Q, with 0–1 SNP differences.','Related sequences support a cluster, not a proven direct transmission chain.'],evidenceOverrides:{outside:{title:'Outside exposure check',rows:patients.map((p,i)=>({label:p.name,text:i===t.source?'Outside conference May 1: attendance confirmed; another attendee later reported illness.':'No corroborated outside exposure in this limited check.'})),note:'A lead, not proof. Compare the onset dates and encounters.'}}};
});
export const simpleSolutions:Record<string,Solution>=Object.fromEntries(themes.map(t=>{
 const order=t.source===0?[0,1,2]:t.source===1?[1,0,2]:[2,1,0],names=['Darren','Carla','Lucy'];
 return [t.id,{source:t.source,tree:[[order[0],order[1]],[order[1],order[2]]],explanation:`${names[order[0]]} is the intended source. Symptoms begin May 4, before the May 5 encounter. ${names[order[1]]} becomes ill May 7 and meets ${names[order[2]]} May 8; that patient becomes ill May 10. Both two-day incubation intervals fit the fictional rules. The administrative chaos is background, not transmission evidence.`,reveal:[{title:'Find the first plausible exposure',text:`${names[order[0]]} has an outside exposure May 1 and symptoms May 4. The May 5 encounter occurs after infectiousness begins.`},{title:'Check both gaps',text:'May 5 → May 7 and May 8 → May 10 each leave two days, within the 1–4 day incubation window.'},{title:'Close the tiny case',text:`The intended simulation is ${order.map(i=>names[i]).join(' → ')}. Use the human encounters, not the administrative mishap, to reconstruct the cluster. Genetic similarity alone does not prove these arrows.`}]}];
}));

