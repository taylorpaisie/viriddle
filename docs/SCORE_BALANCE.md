# Evidence and score balance study

Design proposal only. Official gameplay, database rules, ongoing attempts and historical scores are unchanged. Regenerate with `npm run --silent scores:balance`.

## Proposed allocation

Move from 50 correctness + 50 speed to **70 correctness + 30 speed**. Keep the five-minute deadline, one official submission, zero for wrong answers/timeouts and one purchase per report. Prices remain fixed across cases.

| Component | Current | Proposed |
| --- | ---: | ---: |
| Correct timed answer | 50 | 70 |
| Maximum speed bonus | 50 | 30 |
| Room Booking Logs | −4 | −3 |
| Incubation Analysis | −6 | −4 |
| Patient Interviews | −10 | −6 |
| Contact Tracing | −12 | −8 |
| Outside Exposure Check | −14 | −9 |
| Phylogenetic Tree | −16 | −8 |
| Genomic Sequencing | −18 | −10 |
| All reports | −80 | −48 |

Lower prices keep corroborating evidence affordable. Bookings and computed windows remain the least expensive; interviews and contacts cost more; outside checks and sequencing retain the largest deductions. This ordering is a design hypothesis, not a measured ranking of information value. No category proves a source by itself.

## Correct solve after buying all reports

| Submission time | Current score | Proposed score |
| --- | ---: | ---: |
| 0:00 | 20 | 52 |
| 1:00 | 10 | 46 |
| 2:00 | 0 | 40 |
| 2:30 | 0 | 37 |
| 3:00 | 0 | 34 |
| 3:36 | 0 | 31 |
| 4:00 | 0 | 28 |
| 4:59 | 0 | 23 |
| 5:00 (timeout) | 0 | 0 |

The current all-report score reaches zero at 3:36, even for a correct answer. The proposal keeps it at 31 or more before the deadline; at exactly 5:00 every timed attempt earns zero. Speed uses the existing ceiling convention, with one point lost every 10 seconds instead of every 6 seconds.

## Evidence strategies at 2:30

Illustrative purchases, not claims that these reports suffice to solve every case.

| Reports | Current cost | Current score | Proposed cost | Proposed score |
| --- | ---: | ---: | ---: | ---: |
| Free symptom dates only | 0 | 75 | 0 | 85 |
| Interviews + contacts | 22 | 53 | 14 | 71 |
| Windows + contacts + sequencing | 36 | 39 | 22 | 63 |
| Interviews + contacts + outside checks | 36 | 39 | 23 | 62 |
| All reports | 80 | 0 | 48 | 37 |

## Distribution across all 64 evidence combinations

Each subset is counted once, assuming a correct answer at the stated time. These are mathematical possibilities, **not observed players or predicted frequencies**. The median is an unweighted subset median.

| Time | Model | Minimum | Median | Maximum | Zero-score combinations |
| --- | --- | ---: | ---: | ---: | ---: |
| 1:00 | Current | 10 | 50 | 90 | 0/64 |
| 1:00 | Proposed | 46 | 70 | 94 | 0/64 |
| 2:30 | Current | 0 | 35 | 75 | 2/64 |
| 2:30 | Proposed | 37 | 61 | 85 | 0/64 |
| 4:00 | Current | 0 | 20 | 60 | 17/64 |
| 4:00 | Proposed | 28 | 52 | 76 | 0/64 |
| 4:59 | Current | 0 | 11 | 51 | 33/64 |
| 4:59 | Proposed | 23 | 47 | 71 | 0/64 |

### Score bands at 4:00

| Model | 0 | 1–20 | 21–40 | 41–60 | 61–80 | 81–100 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Current | 17 | 50 | 47 | 14 | 0 | 0 |
| Proposed | 0 | 0 | 16 | 87 | 25 | 0 |

## Incentives and limits

At 0:00 a uniform blind guess among six choices has an expected score of 100/6, about 16.7, in either model. This assumes exactly one correct choice and no prior information; it is not an estimate of player behavior. A certain correct all-report solve at 4:00 earns 0 currently and 28 in the proposal. Expected-score comparisons do not capture confidence, enjoyment, or ranking goals.

The proposal still rewards buying less and solving faster. Buying all reports costs 40 rather than 64 points, and a 10-second improvement is worth one point rather than about 1.67 points. Some players may buy everything routinely, compressing strategy differences; sequencing may become a default purchase. Human playtesting must establish whether the remaining tradeoff is useful.

Untimed practice stays 100 minus purchases: buying all reports would earn 60 instead of 36. This is noncompetitive and should be labeled separately from timed distributions.

## Playtest before rollout

- Use easy, standard and challenging cases. Ask testers to explain which uncertainty motivated each purchase; do not infer usefulness from price alone.
- Compare completion time, correct/incorrect/timeout rates, report purchase rates, evidence spend, and score bands separately by case. Exclude internal testing identities from production summaries.
- Inspect whether outside checks or sequencing become automatic purchases, and whether players feel pressured to guess rather than corroborate.
- Treat small samples and voluntary case ratings cautiously. Do not tune prices toward a target histogram without checking the reasoning experience.

## Requirements for an eventual rules change

Version the rules by daily case with a future UTC activation date, so all official players on a date share the same scoring model. Keep earlier cases and attempts on their original prices and formula, including unfinished attempts and late resumes. Do not recompute historical results. Return the applicable rule version and evidence prices from the server; the client must display and simulate those same rules, with legacy fallback during rollout.

Update transactional server purchase/submission logic, local/practice scoring, the clue shop, field guide, tutorial, confirmation preview, score breakdown and explanatory copy together. Test all 64 purchase subsets, timer boundaries, idempotent purchases, failed submissions, authorization, client/server parity and old/new rule coexistence before applying a migration or deploying.
