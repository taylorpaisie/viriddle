import type {Case} from './model';
// Public narrative only: no patient records, encounters or answers. Old scheduled snapshots keep their evidence.
// Entries retain the original and previous refresh so saved snapshots can be upgraded.
const briefs:Record<string,[original:string,current:string,previous:string]>={
  "october": [
    "Northbank’s Mothman Appreciation Week has a missing trophy, an unauthorized fog machine, and an inflatable mascot declared “structurally emotional.” Now six volunteers are sick. The group chat says curse. The lab says fictional respiratory virus. Find the source of the connected five-person cluster; one infection belongs to a separate chain.",
    "Northbank’s Mothman festival has lost its Golden Moth trophy. A photograph, a mascot head and an unauthorized fog machine have supplied the group chat with three excellent theories about theft and none about infection. Six volunteers are ill with a fictional respiratory virus. Set the trophy mystery aside and trace the connected five-person cluster; one infection belongs to a separate chain.",
    "Northbank’s Mothman festival has a missing trophy, a fog-machine invoice nobody approved, and a committee arguing over whether a nine-foot mascot needs its own insurance. Six volunteers are now ill with a fictional respiratory virus. The group chat has chosen a culprit before anyone has checked the dates. Trace the connected five-person cluster; one infection belongs to a separate chain."
  ],
  "harbor": [
    "A field-station reunion leaves six people ill. Trace the connected five-person cluster and distinguish it from an unrelated travel infection.",
    "Twenty years after their first field season, the station’s old crew has returned to the harbor. The reunion display pairs youthful expedition photographs with present-day job titles; nobody likes both. Now six attendees report illness. Reconstruct the connected five-person cluster and distinguish it from an unrelated travel infection. A shared history does not mean everyone shared an exposure.",
    "The field station’s reunion was meant to repair old friendships. Instead, the guest list became a spreadsheet dispute, the welcome speech acquired three rival versions, and six attendees reported illness. The director wants an explanation before the donors read the group chat. Trace the connected five-person cluster and separate an unrelated travel infection."
  ],
  "glasshouse": [
    "Six members of a botanical lab report symptoms. Find the source of the connected five-person cluster, with one separate introduction among the records.",
    "The botanical lab’s rare orchid is approaching its first bloom in twelve years. The webcam has an audience; the plant has offered no comment. Six people associated with the lab report symptoms, and the vigil has become an investigation. Use the dated human encounters to find the source of the connected five-person cluster, with one separate introduction. The orchid is scenery, not an exposure finding.",
    "The botanical lab’s open house is unraveling: the sponsor’s name is misspelled on every sign, the orchid display has been invoiced twice, and six people are ill. Management suspects the greenhouse; everyone else suspects management. Work through the symptom dates and records to find the source of the connected five-person cluster, with one separate introduction."
  ],
  "rehearsal": [
    "A late-night rehearsal leaves six theater workers ill. One infection is unrelated, and one recorded contact happened too late to explain either person’s onset.",
    "At Lantern Theater, the understudy has learned every line except the one the director just changed. The midnight rehearsal continues under work lights, with the empty auditorium making each missed cue sound enormous. Six theater workers report illness from a fictional respiratory virus. One infection is unrelated, and one recorded contact happened too late to explain either person’s onset. Reconstruct the chain from the records.",
    "The theater’s last rehearsal has overrun again. A sponsor wants a speech, the director wants applause during the speech, and the stage manager wants everyone to go home. Now six workers report illness from a fictional respiratory virus. One infection is unrelated, and one documented meeting occurred too late to explain either person’s onset. Reconstruct the chain before the incident report becomes another rehearsal."
  ],
  "market": [
    "An indoor makers market has two apparent branches of infection. Compare the contact dates with onset dates to trace the five-person cluster to its common source.",
    "The makers market has become an unofficial contest between handmade perfection and things that actually sell. A lopsided ceramic goose is winning. Behind the cheerful stalls, six participants report respiratory symptoms, with two apparent branches in the contact records. Compare encounter dates with symptom onset to trace the five-person cluster to its common source; one infection is separate.",
    "The indoor makers market has sold out of tote bags and patience. Organizers are arguing over a stall map marked FINAL, FINAL-2 and ACTUAL-FINAL while six participants report respiratory symptoms. The contact records suggest two branches. Check dates against symptom onset to trace the five-person cluster back to its common source."
  ],
  "lodge": [
    "A winter retreat produces a staggered symptom timeline. Does the earliest patient belong to the same chain? Follow the sequence of encounters across the lodge.",
    "Snow has delayed departures from the winter retreat. Suitcases wait by the door while delegates negotiate the last decent chair by the fire. Illness reports arrive across a staggered timeline, and the earliest patient seems an obvious starting point. Test that assumption: follow the lodge’s dated encounters and sequence reports to decide which infection belongs outside the five-person chain.",
    "Snow has delayed the retreat’s departures. The organizer has responded with an extra networking session; the delegates have responded by pretending not to hear. Six people report illness on different days, and the earliest case has become everyone’s favorite explanation. Follow the dated encounters and sequence reports to decide whether that early infection belongs to the same chain."
  ],
  "museum": [
    "Several museum staff report illness after an evening installation. A shared contact links three patients, but not every documented encounter could have caused an infection.",
    "After closing time, the museum’s installation crew is arranging an exhibit about extinct animals. In the work lights, an unfinished skeleton casts a much more impressive shadow than the finished display will. Several staff report illness. A shared contact links three patients, but not every documented encounter could have caused infection. Reconstruct the connected five-person cluster and identify the unrelated infection using the supplied records.",
    "The museum’s evening installation has a crooked donor plaque, an unsigned overtime form and six reports of illness. The launch announcement is already queued. A shared contact links three patients, but not every documented encounter could have caused an infection. Use the records before a convenient staff-room theory becomes the official explanation."
  ],
  "signal": [
    "One busy producer appears in most contact records. Investigate whether that person began the cluster or amplified an infection acquired from someone else.",
    "Hilltop Radio is digitizing its archive before the old playback deck finally gives out. Familiar voices emerge from badly labeled tapes, along with a weather forecast that was wrong even then. Six contributors report illness. A busy producer appears in most contact records: determine whether that person began the five-person cluster or amplified an infection acquired from someone else. One infection is unrelated.",
    "The station’s public-health special has generated a correction to the correction, an angry sponsor and six sick contributors. A busy producer appears in nearly every contact record, which has made the staff chat very confident. Establish whether that person began the cluster or passed on an infection acquired from someone else."
  ],
  "riverside": [
    "Two workshop teams develop symptoms on different days. Reconstruct their shared origin while separating a genetically distinct infection from the studio cluster.",
    "Riverside’s community studio is preparing a showcase of repaired household objects. A restored chair has become the centerpiece; its owner insists the wobble is part of its character. Two workshop teams develop symptoms on different days. Reconstruct their shared origin while separating a genetically distinct infection from the five-person studio cluster. The restoration stories supply the setting; the dated encounters supply the evidence.",
    "The workshop’s community showcase is approaching, the budget includes fourteen unexplained extension leads, and two teams have developed symptoms on different days. Every organizer has a theory and an extremely selective memory. Reconstruct their shared origin while separating a genetically distinct infection from the studio cluster."
  ]
};
export function refreshCaseCopy(c:Case):Case{
 const pair=briefs[c.id];if(!pair)return c;
 const previous=[pair[0],pair[2]].find(brief=>c.brief.startsWith(brief));
 return previous?{...c,brief:pair[1]+c.brief.slice(previous.length)}:c;
}
