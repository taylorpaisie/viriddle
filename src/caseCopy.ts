import type {Case} from './model';
// Public narrative only: no patient records, encounters or answers. Old scheduled snapshots keep their evidence.
const briefs:Record<string,[string,string]>={
  "october": [
    "Northbank’s Mothman Appreciation Week has a missing trophy, an unauthorized fog machine, and an inflatable mascot declared “structurally emotional.” Now six volunteers are sick. The group chat says curse. The lab says fictional respiratory virus. Find the source of the connected five-person cluster; one infection belongs to a separate chain.",
    "Northbank’s Mothman festival has a missing trophy, a fog-machine invoice nobody approved, and a committee arguing over whether a nine-foot mascot needs its own insurance. Six volunteers are now ill with a fictional respiratory virus. The group chat has chosen a culprit before anyone has checked the dates. Trace the connected five-person cluster; one infection belongs to a separate chain."
  ],
  "harbor": [
    "A field-station reunion leaves six people ill. Trace the connected five-person cluster and distinguish it from an unrelated travel infection.",
    "The field station’s reunion was meant to repair old friendships. Instead, the guest list became a spreadsheet dispute, the welcome speech acquired three rival versions, and six attendees reported illness. The director wants an explanation before the donors read the group chat. Trace the connected five-person cluster and separate an unrelated travel infection."
  ],
  "glasshouse": [
    "Six members of a botanical lab report symptoms. Find the source of the connected five-person cluster, with one separate introduction among the records.",
    "The botanical lab’s open house is unraveling: the sponsor’s name is misspelled on every sign, the orchid display has been invoiced twice, and six people are ill. Management suspects the greenhouse; everyone else suspects management. Work through the symptom dates and records to find the source of the connected five-person cluster, with one separate introduction."
  ],
  "rehearsal": [
    "A late-night rehearsal leaves six theater workers ill. One infection is unrelated, and one recorded contact happened too late to explain either person’s onset.",
    "The theater’s last rehearsal has overrun again. A sponsor wants a speech, the director wants applause during the speech, and the stage manager wants everyone to go home. Now six workers report illness from a fictional respiratory virus. One infection is unrelated, and one documented meeting occurred too late to explain either person’s onset. Reconstruct the chain before the incident report becomes another rehearsal."
  ],
  "market": [
    "An indoor makers market has two apparent branches of infection. Compare the contact dates with onset dates to trace the five-person cluster to its common source.",
    "The indoor makers market has sold out of tote bags and patience. Organizers are arguing over a stall map marked FINAL, FINAL-2 and ACTUAL-FINAL while six participants report respiratory symptoms. The contact records suggest two branches. Check dates against symptom onset to trace the five-person cluster back to its common source."
  ],
  "lodge": [
    "A winter retreat produces a staggered symptom timeline. Does the earliest patient belong to the same chain? Follow the sequence of encounters across the lodge.",
    "Snow has delayed the retreat’s departures. The organizer has responded with an extra networking session; the delegates have responded by pretending not to hear. Six people report illness on different days, and the earliest case has become everyone’s favorite explanation. Follow the dated encounters and sequence reports to decide whether that early infection belongs to the same chain."
  ],
  "museum": [
    "Several museum staff report illness after an evening installation. A shared contact links three patients, but not every documented encounter could have caused an infection.",
    "The museum’s evening installation has a crooked donor plaque, an unsigned overtime form and six reports of illness. The launch announcement is already queued. A shared contact links three patients, but not every documented encounter could have caused an infection. Use the records before a convenient staff-room theory becomes the official explanation."
  ],
  "signal": [
    "One busy producer appears in most contact records. Investigate whether that person began the cluster or amplified an infection acquired from someone else.",
    "The station’s public-health special has generated a correction to the correction, an angry sponsor and six sick contributors. A busy producer appears in nearly every contact record, which has made the staff chat very confident. Establish whether that person began the cluster or passed on an infection acquired from someone else."
  ],
  "riverside": [
    "Two workshop teams develop symptoms on different days. Reconstruct their shared origin while separating a genetically distinct infection from the studio cluster.",
    "The workshop’s community showcase is approaching, the budget includes fourteen unexplained extension leads, and two teams have developed symptoms on different days. Every organizer has a theory and an extremely selective memory. Reconstruct their shared origin while separating a genetically distinct infection from the studio cluster."
  ]
};
export function refreshCaseCopy(c:Case):Case{const pair=briefs[c.id];if(!pair||!c.brief.startsWith(pair[0]))return c;return {...c,brief:pair[1]+c.brief.slice(pair[0].length)};}
