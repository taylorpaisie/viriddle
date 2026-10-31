# Initial connected sample-case schedule

Destination: Supabase project `virriddle` (`jlvjascwjghyxnljwflx`), organization TKP Games.

Owner approved and uploaded the following 15 date-specific fictional sample cases into `public.daily_cases`, with their evidence and answers in `private.case_secrets`. Existing dates will not be overwritten. This is the existing public prototype rotation, not fresh secret competitive puzzles. Future dates remain unreleased until 00:00 UTC on that date.

| UTC date | Case | Fictional patient names |
| --- | --- | --- |
| 2026-10-29 | The Mothman Meltdown | Nate, Cherie, Bob, Bret, Luke, Joicy |
| 2026-10-30 | The Midnight Rehearsal | Cherie, Bob, Bret, Luke, Joicy, Ben |
| 2026-10-31 | The Haunting at North Quay | Bob, Bret, Luke, Joicy, Ben, Anthony |
| 2026-11-01 | The Snowbound Lodge | Bret, Luke, Joicy, Ben, Anthony, Hamilton |
| 2026-11-02 | Museum After Hours | Luke, Joicy, Ben, Anthony, Hamilton, Darren |
| 2026-11-03 | The Signal Station | Joicy, Ben, Anthony, Hamilton, Darren, Carla |
| 2026-11-04 | The Riverside Workshop | Ben, Anthony, Hamilton, Darren, Carla, Melanie |
| 2026-11-05 | The Mothman Meltdown | Anthony, Hamilton, Darren, Carla, Melanie, Andrea |
| 2026-11-06 | The Harbor Gathering | Hamilton, Darren, Carla, Melanie, Andrea, Lucy |
| 2026-11-07 | The Glasshouse Incident | Darren, Carla, Melanie, Andrea, Lucy, Brittany |
| 2026-11-08 | The Midnight Rehearsal | Carla, Melanie, Andrea, Lucy, Brittany, Nídia |
| 2026-11-09 | The Night Market | Melanie, Andrea, Lucy, Brittany, Nídia, Luis |
| 2026-11-10 | The Snowbound Lodge | Andrea, Lucy, Brittany, Nídia, Luis, Selim |
| 2026-11-11 | Museum After Hours | Lucy, Brittany, Nídia, Luis, Selim, Nate |
| 2026-11-12 | The Signal Station | Brittany, Nídia, Luis, Selim, Nate, Cherie |

The four-minute timer, six evidence prices, source solutions, transmission relationships, and daily name rotation remain unchanged. Browser-local historic scores are not uploaded. The upload was verified and the connected build is active on the current Sites URL and GitHub Pages.


## Added hospital mystery

`2026-11-13` — **Before You Arrived**. A fictional hospital-associated cluster inspired by the scientific investigation of the Libyan outbreak. The original 15 dates and all existing attempts remain unchanged.

This case is explicitly previewable as **sample practice** before its scheduled day. `outbreak_practice` returns only fixtures marked `practice_available: true`; it never creates a competitive attempt. The upcoming daily is therefore a known sample, not a fresh secret competitive puzzle.

Six explanation choices replace patient-name choices for this case. The answer index still uses the existing six-choice API contract. The supported outcome is an earlier hospital-associated outbreak with the individual source unresolved. No direct transmission tree is invented. Biological rules are fictional and case-specific (2–6 days), not HIV rules.

Historical source: [de Oliveira et al., Nature (2006), HIV-1 and HCV sequences from Libyan outbreak](https://doi.org/10.1038/444836a). No historical names, victim records, or allegations are reproduced in the playable scenario.

## Halloween editorial override — October 31, 2026

Applied `scripts/halloween-2026.sql` to the connected daily case at the owner's request on October 31 UTC, before any official attempts existed. This is a date-specific server snapshot override, not a change to every Night Market fixture or to the browser-local template rotation.

**The Haunting at North Quay** follows a Halloween market's preview events and the disastrous preparations for opening night. The briefing and six interview transcripts now share that setting. Darren appears as an off-screen publicity organizer; his statement is explicitly flavor, not exposure evidence. The existing six patients and their order remain unchanged.

All case month labels were changed consistently from November to October, including incubation windows, encounters, outside-exposure records and the final explanation. Numeric onset/contact days, source index, transmission tree, genetic distances, release timestamp, puzzle version, evidence prices and five-minute timer were preserved.

The transaction locks the target case, rejects any existing official attempt or changed input snapshots, and verifies that answer structure, patient records, contact dates and all stored attempts remain unchanged. It is idempotent after successful application. No schema migration is needed; do not add this to automatic deployments.

Live verification confirmed six interview rows and six matching interview strings, six evidence categories, valid 1–4-day transmission windows, consistent October report labels, unrevealed public interviews, unchanged answer data except month wording, and zero attempts at application. This update does not apply the separately pending practice-story reseed.
