export type Patient={name:string;onset:number;role:string;interview:string};
export type Case={id:string;title:string;place:string;month:string;brief:string;pathogen:string;incubation:string;patients:Patient[];contacts:[number,number,number][];genomics:string[];interviewNote:string};
export const cases:Case[]=[{
id:'october',title:'The October Cluster',place:'NORTHBANK COMMUNITY CENTER',month:'October',pathogen:'Fictional respiratory virus',incubation:'1–4 days',brief:'Six people. A shared community center. One deceptive timeline. Identify the source of the connected five-person cluster; one patient belongs to a separate introduction.',interviewNote:'In this simulation, infectiousness begins at symptom onset. There is no presymptomatic transmission.',patients:[
{name:'Finley',onset:7,role:'Visiting illustrator',interview:'Attended a different event on October 3. No reported contact with the other five patients.'},
{name:'Rowan',onset:8,role:'Community coordinator',interview:'Returned from an outside-group gathering October 5. Symptoms began October 8. Met Blair October 9.'},
{name:'Blair',onset:11,role:'Workshop instructor',interview:'Worked with Rowan October 9. Led a workshop with Casey and Devon October 12.'},
{name:'Casey',onset:13,role:'Volunteer librarian',interview:'Attended Blair’s October 12 workshop. Met Ellis October 14.'},
{name:'Devon',onset:14,role:'Sound technician',interview:'Helped Blair set up on October 12. No other recorded group exposures.'},
{name:'Ellis',onset:16,role:'Student volunteer',interview:'Worked a library shift alongside Casey October 14.'}],contacts:[[1,2,9],[2,3,12],[2,4,12],[3,5,14]],genomics:['Finley: lineage B · 27–29 SNPs from the other five.','Rowan, Blair, Casey, Devon and Ellis: lineage A · pairwise distances 0–2 SNPs.','Rowan–Blair: 0 · Blair–Casey: 1 · Blair–Devon: 1 · Casey–Ellis: 1 SNP.']},
{id:'harbor',title:'The Harbor Gathering',place:'EAST HARBOR FIELD STATION',month:'October',pathogen:'Fictional respiratory virus',incubation:'1–4 days',brief:'A field-station reunion leaves six people ill. Trace the connected five-person cluster and distinguish it from an unrelated travel infection.',interviewNote:'Infectiousness starts at symptom onset. All listed dates fall in October.',patients:[
{name:'Mira',onset:3,role:'Marine biologist',interview:'Fell ill after an outside-group trip September 30. Shared a lab with Theo October 4.'},
{name:'Theo',onset:6,role:'Field researcher',interview:'Worked with Mira October 4 and met Sage and Luca October 7.'},
{name:'Sage',onset:9,role:'Research assistant',interview:'Met Theo October 7 and worked with Quinn October 10.'},
{name:'Luca',onset:10,role:'Boat technician',interview:'Shared equipment space with Theo October 7.'},
{name:'Quinn',onset:12,role:'Station cook',interview:'Spent an afternoon with Sage October 10.'},
{name:'Jules',onset:2,role:'Visiting naturalist',interview:'Returned from separate travel. No documented interactions with the other five.'}],contacts:[[0,1,4],[1,2,7],[1,3,7],[2,4,10]],genomics:['Mira, Theo, Sage, Luca and Quinn: lineage H · pairwise distances 0–2 SNPs.','Jules: lineage J · 24–26 SNPs from lineage H.','Mira–Theo: 0 · Theo–Sage: 1 · Theo–Luca: 1 · Sage–Quinn: 1 SNP.']},
{id:'glasshouse',title:'The Glasshouse Incident',place:'WESTFIELD BOTANICAL LAB',month:'October',pathogen:'Fictional respiratory virus',incubation:'1–4 days',brief:'Six members of a botanical lab report symptoms. Find the source of the connected five-person cluster, with one separate introduction among the records.',interviewNote:'Infectiousness starts at symptom onset. All dates fall in October.',patients:[
{name:'Arden',onset:18,role:'Greenhouse assistant',interview:'Worked with Niko October 16. Met Remy and Wren October 19.'},
{name:'Remy',onset:21,role:'Botanist',interview:'Worked with Arden October 19. Shared an office with Kit October 22.'},
{name:'Niko',onset:15,role:'Lab coordinator',interview:'Attended an outside-group meeting October 12. Fell ill October 15; met Arden October 16.'},
{name:'Wren',onset:22,role:'Plant illustrator',interview:'Attended Arden’s session October 19.'},
{name:'Kit',onset:24,role:'Graduate student',interview:'Shared an office with Remy October 22.'},
{name:'Avery',onset:14,role:'Visiting ecologist',interview:'Fell ill following unrelated travel. No documented interaction with the other five.'}],contacts:[[2,0,16],[0,1,19],[0,3,19],[1,4,22]],genomics:['Niko, Arden, Remy, Wren and Kit: lineage G · pairwise distances 0–2 SNPs.','Avery: lineage X · 31–33 SNPs from lineage G.','Niko–Arden: 0 · Arden–Remy: 1 · Arden–Wren: 1 · Remy–Kit: 1 SNP.']}];
export const evidence=[{id:'interviews',title:'Patient Interviews',cost:10,description:'Follow the stories behind the symptoms.',icon:'interview'},{id:'contacts',title:'Contact Tracing',cost:12,description:'Connect people, places and dates.',icon:'network'},{id:'genomics',title:'Genomic Sequencing',cost:18,description:'Compare the pathogen’s fingerprints.',icon:'dna'}] as const;
export const nyDate=(d=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
export const dayNumber=(date:string)=>Math.floor((Date.parse(date+'T12:00:00Z')-Date.parse('2026-10-02T12:00:00Z'))/86400000);
export const caseFor=(date:string)=>cases[((dayNumber(date)%3)+3)%3];
