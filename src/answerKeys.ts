// PROTOTYPE ONLY. Production: move this module and validation to a server endpoint.
// Public evidence stays in cases.ts; the browser necessarily contains these demo keys.
export const answerKeys:Record<string,{source:number;tree:[number,number][];explanation:string}>={
october:{source:1,tree:[[1,2],[2,3],[2,4],[3,5]],explanation:'Rowan’s outside exposure precedes October 8 onset. The October 9 contact fits Blair’s October 11 onset; Blair’s October 12 contacts fit Casey and Devon; Casey’s October 14 contact fits Ellis. Finley’s genetically distinct infection is a separate introduction.'},
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
