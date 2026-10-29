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
cases.push(...[
  {
    "id": "rehearsal",
    "title": "The Midnight Rehearsal",
    "place": "LANTERN THEATER",
    "month": "November",
    "pathogen": "Fictional respiratory virus",
    "incubation": "1–4 days",
    "brief": "A late-night rehearsal leaves six theater workers ill. One infection is unrelated, and one recorded contact happened too late to explain either person’s onset.",
    "interviewNote": "Infectiousness begins at symptom onset. Find the source of the connected five-person cluster; one patient has a separate introduction.",
    "patients": [
      {
        "name": "Noa",
        "onset": 9,
        "role": "Stage manager",
        "interview": "Worked alongside Tess on November 7. Met Remy on November 10."
      },
      {
        "name": "Sasha",
        "onset": 11,
        "role": "Lighting designer",
        "interview": "Worked alongside Tess on November 8. Also reported a later encounter with Remy on November 12."
      },
      {
        "name": "Remy",
        "onset": 12,
        "role": "Costume assistant",
        "interview": "Worked alongside Noa on November 10. Met Wes on November 13. Also reported a later encounter with Sasha on November 12."
      },
      {
        "name": "Tess",
        "onset": 6,
        "role": "Touring musician",
        "interview": "Attended a touring production on November 3. Symptoms began November 6. Met Noa on November 7. Met Sasha on November 8."
      },
      {
        "name": "Wes",
        "onset": 14,
        "role": "Volunteer usher",
        "interview": "Worked alongside Remy on November 13."
      },
      {
        "name": "Ira",
        "onset": 5,
        "role": "Visiting photographer",
        "interview": "Recently returned from separate travel. No documented encounter with the other five patients before symptom onset."
      }
    ],
    "contacts": [
      [
        3,
        0,
        7
      ],
      [
        3,
        1,
        8
      ],
      [
        0,
        2,
        10
      ],
      [
        2,
        4,
        13
      ],
      [
        1,
        2,
        12
      ]
    ],
    "genomics": [
      "Noa, Sasha, Remy, Tess, Wes: lineage T · pairwise distances 0–4 SNPs.",
      "Ira: lineage Q · 26–30 SNPs from the cluster.",
      "Sequence similarities alone cannot identify who infected whom. Use onset dates and reported encounters to test possible directions."
    ]
  },
  {
    "id": "market",
    "title": "The Night Market",
    "place": "NORTH QUAY MAKERS MARKET",
    "month": "November",
    "pathogen": "Fictional respiratory virus",
    "incubation": "1–4 days",
    "brief": "An indoor makers market has two apparent branches of infection. Compare the contact dates with onset dates to trace the five-person cluster to its common source.",
    "interviewNote": "Infectiousness begins at symptom onset. Find the source of the connected five-person cluster; one patient has a separate introduction.",
    "patients": [
      {
        "name": "Ada",
        "onset": 21,
        "role": "Ceramics vendor",
        "interview": "Worked alongside Nell on November 18. Met Bao on November 22."
      },
      {
        "name": "Bao",
        "onset": 24,
        "role": "Market volunteer",
        "interview": "Worked alongside Ada on November 22."
      },
      {
        "name": "Kai",
        "onset": 20,
        "role": "Printmaker",
        "interview": "Worked alongside Nell on November 18. Met Luz on November 21."
      },
      {
        "name": "Luz",
        "onset": 23,
        "role": "Event coordinator",
        "interview": "Worked alongside Kai on November 21."
      },
      {
        "name": "Nell",
        "onset": 17,
        "role": "Traveling exhibitor",
        "interview": "Attended an exhibition in another city on November 14. Symptoms began November 17. Met Ada on November 18. Met Kai on November 18."
      },
      {
        "name": "Pax",
        "onset": 16,
        "role": "Delivery driver",
        "interview": "Recently returned from separate travel. No documented encounter with the other five patients before symptom onset."
      }
    ],
    "contacts": [
      [
        4,
        0,
        18
      ],
      [
        4,
        2,
        18
      ],
      [
        0,
        1,
        22
      ],
      [
        2,
        3,
        21
      ]
    ],
    "genomics": [
      "Ada, Bao, Kai, Luz, Nell: lineage M · pairwise distances 0–4 SNPs.",
      "Pax: lineage Z · 22–26 SNPs from the cluster.",
      "Sequence similarities alone cannot identify who infected whom. Use onset dates and reported encounters to test possible directions."
    ]
  },
  {
    "id": "lodge",
    "title": "The Snowbound Lodge",
    "place": "PINE RIDGE ASTRONOMY RETREAT",
    "month": "December",
    "pathogen": "Fictional respiratory virus",
    "incubation": "1–4 days",
    "brief": "A winter retreat produces a staggered symptom timeline. Does the earliest patient belong to the same chain? Follow the sequence of encounters across the lodge.",
    "interviewNote": "Infectiousness begins at symptom onset. Find the source of the connected five-person cluster; one patient has a separate introduction.",
    "patients": [
      {
        "name": "Owen",
        "onset": 5,
        "role": "Telescope technician",
        "interview": "Worked alongside Emery on December 3. Met Mae on December 6."
      },
      {
        "name": "Mae",
        "onset": 8,
        "role": "Retreat guide",
        "interview": "Worked alongside Owen on December 6. Met Rory on December 9."
      },
      {
        "name": "Rory",
        "onset": 11,
        "role": "Astronomy student",
        "interview": "Worked alongside Mae on December 9. Met Lea on December 12."
      },
      {
        "name": "Lea",
        "onset": 14,
        "role": "Volunteer cook",
        "interview": "Worked alongside Rory on December 12."
      },
      {
        "name": "Sol",
        "onset": 1,
        "role": "Travel writer",
        "interview": "Recently returned from separate travel. No documented encounter with the other five patients before symptom onset."
      },
      {
        "name": "Emery",
        "onset": 2,
        "role": "Visiting lecturer",
        "interview": "Attended an outside-group lecture earlier that day on December 1. Symptoms began December 2. Met Owen on December 3."
      }
    ],
    "contacts": [
      [
        5,
        0,
        3
      ],
      [
        0,
        1,
        6
      ],
      [
        1,
        2,
        9
      ],
      [
        2,
        3,
        12
      ]
    ],
    "genomics": [
      "Owen, Mae, Rory, Lea, Emery: lineage L · pairwise distances 0–4 SNPs.",
      "Sol: lineage S · 34–38 SNPs from the cluster.",
      "Sequence similarities alone cannot identify who infected whom. Use onset dates and reported encounters to test possible directions."
    ]
  },
  {
    "id": "museum",
    "title": "Museum After Hours",
    "place": "WESTBRIDGE NATURAL HISTORY MUSEUM",
    "month": "September",
    "pathogen": "Fictional respiratory virus",
    "incubation": "1–4 days",
    "brief": "Several museum staff report illness after an evening installation. A shared contact links three patients, but not every documented encounter could have caused an infection.",
    "interviewNote": "Infectiousness begins at symptom onset. Find the source of the connected five-person cluster; one patient has a separate introduction.",
    "patients": [
      {
        "name": "Robin",
        "onset": 10,
        "role": "Guest curator",
        "interview": "Attended a conference outside the museum group on September 7. Symptoms began September 10. Met Rhea on September 11. Met Milo on September 11. Met Cleo on September 11."
      },
      {
        "name": "Rhea",
        "onset": 14,
        "role": "Exhibit designer",
        "interview": "Worked alongside Robin on September 11. Also reported a later encounter with Drew on September 17."
      },
      {
        "name": "Milo",
        "onset": 12,
        "role": "Museum educator",
        "interview": "Worked alongside Robin on September 11."
      },
      {
        "name": "Cleo",
        "onset": 13,
        "role": "Collections assistant",
        "interview": "Worked alongside Robin on September 11. Met Drew on September 14."
      },
      {
        "name": "Drew",
        "onset": 16,
        "role": "Graduate intern",
        "interview": "Worked alongside Cleo on September 14. Also reported a later encounter with Rhea on September 17."
      },
      {
        "name": "Alix",
        "onset": 9,
        "role": "Visiting conservator",
        "interview": "Recently returned from separate travel. No documented encounter with the other five patients before symptom onset."
      }
    ],
    "contacts": [
      [
        0,
        1,
        11
      ],
      [
        0,
        2,
        11
      ],
      [
        0,
        3,
        11
      ],
      [
        3,
        4,
        14
      ],
      [
        1,
        4,
        17
      ]
    ],
    "genomics": [
      "Robin, Rhea, Milo, Cleo, Drew: lineage U · pairwise distances 0–4 SNPs.",
      "Alix: lineage V · 20–24 SNPs from the cluster.",
      "Sequence similarities alone cannot identify who infected whom. Use onset dates and reported encounters to test possible directions."
    ]
  },
  {
    "id": "signal",
    "title": "The Signal Station",
    "place": "HILLTOP COMMUNITY RADIO",
    "month": "August",
    "pathogen": "Fictional respiratory virus",
    "incubation": "1–4 days",
    "brief": "One busy producer appears in most contact records. Investigate whether that person began the cluster or amplified an infection acquired from someone else.",
    "interviewNote": "Infectiousness begins at symptom onset. Find the source of the connected five-person cluster; one patient has a separate introduction.",
    "patients": [
      {
        "name": "Ash",
        "onset": 10,
        "role": "Audio engineer",
        "interview": "Worked alongside Brook on August 8."
      },
      {
        "name": "Brook",
        "onset": 7,
        "role": "Broadcast producer",
        "interview": "Worked alongside Quinn on August 6. Met Ash on August 8. Met Fern on August 8. Met Reed on August 9."
      },
      {
        "name": "Quinn",
        "onset": 5,
        "role": "Visiting presenter",
        "interview": "Attended a regional broadcast event on August 2. Symptoms began August 5. Met Brook on August 6."
      },
      {
        "name": "Fern",
        "onset": 11,
        "role": "News reader",
        "interview": "Worked alongside Brook on August 8."
      },
      {
        "name": "Reed",
        "onset": 12,
        "role": "Student reporter",
        "interview": "Worked alongside Brook on August 9."
      },
      {
        "name": "Skye",
        "onset": 4,
        "role": "Independent podcaster",
        "interview": "Recently returned from separate travel. No documented encounter with the other five patients before symptom onset."
      }
    ],
    "contacts": [
      [
        2,
        1,
        6
      ],
      [
        1,
        0,
        8
      ],
      [
        1,
        3,
        8
      ],
      [
        1,
        4,
        9
      ]
    ],
    "genomics": [
      "Ash, Brook, Quinn, Fern, Reed: lineage R · pairwise distances 0–4 SNPs.",
      "Skye: lineage P · 29–33 SNPs from the cluster.",
      "Sequence similarities alone cannot identify who infected whom. Use onset dates and reported encounters to test possible directions."
    ]
  },
  {
    "id": "riverside",
    "title": "The Riverside Workshop",
    "place": "RIVERSIDE COMMUNITY STUDIO",
    "month": "April",
    "pathogen": "Fictional respiratory virus",
    "incubation": "1–4 days",
    "brief": "Two workshop teams develop symptoms on different days. Reconstruct their shared origin while separating a genetically distinct infection from the studio cluster.",
    "interviewNote": "Infectiousness begins at symptom onset. Find the source of the connected five-person cluster; one patient has a separate introduction.",
    "patients": [
      {
        "name": "Cameron",
        "onset": 22,
        "role": "Woodworking instructor",
        "interview": "Worked alongside Harper on April 20. Met Dana on April 23."
      },
      {
        "name": "Harper",
        "onset": 19,
        "role": "Visiting artist",
        "interview": "Attended an outside-group art fair on April 16. Symptoms began April 19. Met Cameron on April 20. Met Jules on April 21."
      },
      {
        "name": "Jules",
        "onset": 23,
        "role": "Studio technician",
        "interview": "Worked alongside Harper on April 21. Met Eden on April 24."
      },
      {
        "name": "Dana",
        "onset": 25,
        "role": "Workshop attendee",
        "interview": "Worked alongside Cameron on April 23."
      },
      {
        "name": "Eden",
        "onset": 27,
        "role": "Volunteer organizer",
        "interview": "Worked alongside Jules on April 24."
      },
      {
        "name": "Morgan",
        "onset": 18,
        "role": "Weekend visitor",
        "interview": "Recently returned from separate travel. No documented encounter with the other five patients before symptom onset."
      }
    ],
    "contacts": [
      [
        1,
        0,
        20
      ],
      [
        1,
        2,
        21
      ],
      [
        0,
        3,
        23
      ],
      [
        2,
        4,
        24
      ]
    ],
    "genomics": [
      "Cameron, Harper, Jules, Dana, Eden: lineage W · pairwise distances 0–4 SNPs.",
      "Morgan: lineage Y · 25–29 SNPs from the cluster.",
      "Sequence similarities alone cannot identify who infected whom. Use onset dates and reported encounters to test possible directions."
    ]
  }
]);
export const evidence=[{id:'interviews',title:'Patient Interviews',cost:10,description:'Follow the stories behind the symptoms.',icon:'interview'},{id:'contacts',title:'Contact Tracing',cost:12,description:'Connect people, places and dates.',icon:'network'},{id:'genomics',title:'Genomic Sequencing',cost:18,description:'Compare the pathogen’s fingerprints.',icon:'dna'}] as const;
export const nyDate=(d=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
export const dayNumber=(date:string)=>Math.floor((Date.parse(date+'T12:00:00Z')-Date.parse('2026-10-02T12:00:00Z'))/86400000);
// Keep the original schedule through October 29 so existing results remain valid.
export const EXPANDED_SCHEDULE_START = '2026-10-30';
export const caseFor=(date:string)=>{
  if(date < EXPANDED_SCHEDULE_START) return cases[((dayNumber(date)%3)+3)%3];
  const days = dayNumber(date)-dayNumber(EXPANDED_SCHEDULE_START);
  return cases[(days+3)%cases.length];
};
