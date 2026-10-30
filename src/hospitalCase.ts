import type {Case} from './model';

// Fictional teaching case. Historical inspiration is credited; no real patient data is used.
export const hospitalCase:Case={
 id:'before-you-arrived',title:'Before You Arrived',place:'ASTER HOSPITAL · RECORDS REVIEW',month:'June',
 pathogen:'Fictional procedure-associated virus',incubation:'2–6 days',incubationDays:[2,6],
 infectiousness:'Person-to-person spread is not assumed',practice_available:true,
 objective:'Which explanation best fits the hospital cluster? A person may not be identifiable.',
 inspiration:{label:'Inspired by the scientific investigation of the Libyan hospital outbreak. Characters, pathogen, dates and records are invented.',url:'https://doi.org/10.1038/444836a'},
 brief:'Six patients. A visiting medical team. One accusation spreading faster than the evidence. At Aster Hospital, administrators blame the new team for a cluster detected during their first week. A locked archive holds older samples; the treatment ledger has gaps; the press wants a name by noon. Reconstruct what the records support before a convenient explanation becomes the official story. Your task is to choose the strongest explanation—not to assign guilt.',
 interviewNote:'Fictional rules: symptoms appear 2–6 days after infection. Casual meetings are not established transmission routes. Onset and sample-collection dates are different. Staff arrival dates, treatment logs and archived samples matter.',
 hypotheses:[
  'The visiting team introduced all six infections after arriving.',
  'The earliest symptomatic patient is definitely the source of all six.',
  'A visitor introduced the entire cluster after June 14.',
  'All six infections are unrelated introductions.',
  'Matching sequences prove a direct patient-to-patient chain.',
  'An earlier hospital-associated outbreak; individual source unresolved.'
 ],
 patients:[
  {name:'Ari',onset:8,role:'Patient · wrist procedure',interview:'My procedure was June 6, symptoms June 8. I returned for a check June 11 and met Bea in the waiting room. The visiting team arrived much later. I remember a treatment trolley, not who handled every item. Being first on this list does not tell you how I became infected.'},
  {name:'Bea',onset:10,role:'Patient · outpatient treatment',interview:'I was treated June 7. Symptoms started June 10, before I met Ari at follow-up June 11. Someone asked whether we shared a drink. We did not. The old laboratory receipt has my sample collection date, although the result was only entered during the new team’s first week.'},
  {name:'Cory',onset:12,role:'Patient · minor procedure',interview:'Treatment June 8, symptoms June 12. Drew and I spoke in the waiting area June 13. The visiting team had not started yet. I cannot identify a contaminated item. The hospital asked us to remember staff faces; I would rather they checked the dated records.'},
  {name:'Drew',onset:13,role:'Patient · day treatment',interview:'My treatment was June 10. Symptoms June 13. I met Cory that afternoon, after both of us were already unwell. I had never met the visiting team before their June 14 induction. A photograph from induction is circulating as if it were a photograph of the outbreak beginning.'},
  {name:'Em',onset:17,role:'Patient · dressing procedure',interview:'I had treatment June 14 and became ill June 17. That was the visitors’ first day, so everyone assumes the date explains everything. A trolley was brought from the same treatment suite used earlier in the month. I cannot tell you whether any particular instrument was reused.'},
  {name:'Faye',onset:19,role:'Patient · follow-up procedure',interview:'Treatment June 16, symptoms June 19. I saw Em in the corridor June 17. It was a brief conversation, not a documented exposure route for this fictional pathogen. I want an explanation, but choosing a name because it appears on the latest staff list is not an explanation.'}
 ],
 contacts:[[0,1,11],[2,3,13],[4,5,17]],
 contactDetails:['Follow-up waiting room; both patients already symptomatic.','Waiting area; symptoms had already begun in both patients.','Brief corridor conversation; no established exposure route.'],
 genomics:[
  'All six samples form one closely related lineage, separated by 0–2 SNPs in this fictional dataset.',
  'Archived specimens collected June 9 and June 11 contain that same lineage. Collection dates are verified in the original accession book.',
  'This supports circulation before June 14. Genetic similarity cannot identify a direct donor, transmission direction, deliberate action or an exact contaminated item.'
 ],
 evidenceOverrides:{
  bookings:{title:'Treatment-suite ledger · recorded procedures',rows:[{label:'June 6 / 7 / 8 / 10',text:'Four procedures in Suite B before the visiting team arrived. The same trolley identifier appears on each entry.'},{label:'June 14 / 16',text:'Two later procedures in Suite B use the same trolley identifier. Some equipment-processing entries are missing.'}],note:'Shared equipment records suggest a route to investigate. They do not establish that an item was contaminated.'},
  windows:{title:'Exposure windows · fictional 2–6 day incubation',rows:[],note:'Computed from symptoms, not sample-report dates. A plausible treatment date is an opportunity, not proof of infection.'},
  outside:{title:'Independent records · staff arrival and archived specimens',rows:[{label:'June 14 · visiting-team arrival',text:'Travel manifests, induction signatures and badge activation independently place the team’s first hospital access on June 14.'},{label:'June 9 / 11 · archived samples',text:'Original accession entries verify specimens from two patients were collected before June 14. Positive results were entered later, on June 18.'},{label:'Records review',text:'No complete equipment-processing chain or exhaustive community exposure history is available.'}],note:'A late report date does not mean a late infection. Missing records leave the individual source unresolved.'}
 }
};
