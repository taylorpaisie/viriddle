// PROTOTYPE ONLY. Production: move this module and validation to a server endpoint.
// Public evidence stays in cases.ts; the browser necessarily contains these demo keys.
export const answerKeys:Record<string,{source:number;tree:[number,number][];explanation:string;reveal?:{title:string;text:string}[]}>={
october:{
  "source": 1,
  "tree": [
    [
      1,
      2
    ],
    [
      2,
      3
    ],
    [
      2,
      4
    ],
    [
      3,
      5
    ]
  ],
  "explanation": "Rowan is the intended source of the connected cluster. The simulated chain follows an office crisis, a mascot repair clinic, and a trophy-discovering cleanup. Blair is the busy amplifier, not the starting point. Finley’s earlier illness belongs to a separate introduction. The curse remains outside the laboratory’s jurisdiction.",
  "reveal": [
    {
      "title": "The opening act happened elsewhere",
      "text": "Rowan attended the October 5 organizers’ gathering and became symptomatic October 8: a plausible three-day incubation. The outside record supports an introduction. It does not establish precisely where infection occurred, however confidently the group chat identifies a curse."
    },
    {
      "title": "October 9 · Rowan → Blair",
      "text": "Rain forced Rowan and Blair into a 40-minute office planning session October 9. Rowan was already symptomatic; Blair’s October 11 onset followed two days later. The inflatable Mothman explains the meeting. It does not explain the infection by itself."
    },
    {
      "title": "October 12 · Blair → Casey and Devon",
      "text": "Blair was symptomatic before the October 12 clinic. Casey’s adjacent prop-sorting and Devon’s microphone troubleshooting supply two contact opportunities. Their onsets one and two days later fit. A busy contact hub can spread a cluster without having started it. Renting theatrical fog is not source evidence."
    },
    {
      "title": "October 14 · Casey → Ellis",
      "text": "Casey was symptomatic before the October 14 storeroom cleanup. Ellis became ill two days afterward. Crucially, Ellis never attended the repair clinic. The trophy discovery makes a good anecdote; the dated encounter makes a plausible link."
    },
    {
      "title": "The tempting wrong turn · Finley",
      "text": "Finley was sick first, but delivered posters without meeting anyone and canceled the shift. Their separate exposure and distinct lineage support another introduction. The five related sequences support this fictional cluster, not proof of individual arrows. The posters and trophy are officially released without charge."
    }
  ]
},
harbor:{source:0,tree:[[0,1],[1,2],[1,3],[2,4]],explanation:'Mira’s outside exposure and October 3 onset precede the October 4 contact with Theo. Theo’s October 7 contacts account for Sage and Luca; Sage’s October 10 contact accounts for Quinn. Jules has a distinct lineage.'},
glasshouse:{source:2,tree:[[2,0],[0,1],[0,3],[1,4]],explanation:'Niko’s October 15 onset precedes contact with Arden on October 16. Arden’s October 19 contacts account for Remy and Wren, and Remy’s October 22 contact accounts for Kit. Avery is genetically distinct.'}};

Object.assign(answerKeys, {
  "rehearsal": {
    "source": 3,
    "tree": [
      [
        3,
        0
      ],
      [
        3,
        1
      ],
      [
        0,
        2
      ],
      [
        2,
        4
      ]
    ],
    "explanation": "Tess had an earlier outside-group exposure and the earliest symptom onset within the genetically related cluster. Tess met Noa on November 7, 2 day(s) before Noa’s onset. Tess met Sasha on November 8, 3 day(s) before Sasha’s onset. Noa met Remy on November 10, 2 day(s) before Remy’s onset. Remy met Wes on November 13, 1 day(s) before Wes’s onset. Ira has a genetically distinct infection and belongs to a separate introduction. The additional recorded contact happened after both patients’ symptoms began, so it cannot explain either infection under this simulation’s rules."
  },
  "market": {
    "source": 4,
    "tree": [
      [
        4,
        0
      ],
      [
        4,
        2
      ],
      [
        0,
        1
      ],
      [
        2,
        3
      ]
    ],
    "explanation": "Nell had an earlier outside-group exposure and the earliest symptom onset within the genetically related cluster. Nell met Ada on November 18, 3 day(s) before Ada’s onset. Nell met Kai on November 18, 2 day(s) before Kai’s onset. Ada met Bao on November 22, 2 day(s) before Bao’s onset. Kai met Luz on November 21, 2 day(s) before Luz’s onset. Pax has a genetically distinct infection and belongs to a separate introduction."
  },
  "lodge": {
    "source": 5,
    "tree": [
      [
        5,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        3
      ]
    ],
    "explanation": "Emery had an earlier outside-group exposure and the earliest symptom onset within the genetically related cluster. Emery met Owen on December 3, 2 day(s) before Owen’s onset. Owen met Mae on December 6, 2 day(s) before Mae’s onset. Mae met Rory on December 9, 2 day(s) before Rory’s onset. Rory met Lea on December 12, 2 day(s) before Lea’s onset. Sol has a genetically distinct infection and belongs to a separate introduction."
  },
  "museum": {
    "source": 0,
    "tree": [
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        0,
        3
      ],
      [
        3,
        4
      ]
    ],
    "explanation": "Robin had an earlier outside-group exposure and the earliest symptom onset within the genetically related cluster. Robin met Rhea on September 11, 3 day(s) before Rhea’s onset. Robin met Milo on September 11, 1 day(s) before Milo’s onset. Robin met Cleo on September 11, 2 day(s) before Cleo’s onset. Cleo met Drew on September 14, 2 day(s) before Drew’s onset. Alix has a genetically distinct infection and belongs to a separate introduction. The additional recorded contact happened after both patients’ symptoms began, so it cannot explain either infection under this simulation’s rules."
  },
  "signal": {
    "source": 2,
    "tree": [
      [
        2,
        1
      ],
      [
        1,
        0
      ],
      [
        1,
        3
      ],
      [
        1,
        4
      ]
    ],
    "explanation": "Quinn had an earlier outside-group exposure and the earliest symptom onset within the genetically related cluster. Quinn met Brook on August 6, 1 day(s) before Brook’s onset. Brook met Ash on August 8, 2 day(s) before Ash’s onset. Brook met Fern on August 8, 3 day(s) before Fern’s onset. Brook met Reed on August 9, 3 day(s) before Reed’s onset. Skye has a genetically distinct infection and belongs to a separate introduction."
  },
  "riverside": {
    "source": 1,
    "tree": [
      [
        1,
        0
      ],
      [
        1,
        2
      ],
      [
        0,
        3
      ],
      [
        2,
        4
      ]
    ],
    "explanation": "Harper had an earlier outside-group exposure and the earliest symptom onset within the genetically related cluster. Harper met Cameron on April 20, 2 day(s) before Cameron’s onset. Harper met Jules on April 21, 2 day(s) before Jules’s onset. Cameron met Dana on April 23, 2 day(s) before Dana’s onset. Jules met Eden on April 24, 3 day(s) before Eden’s onset. Morgan has a genetically distinct infection and belongs to a separate introduction."
  }
});
