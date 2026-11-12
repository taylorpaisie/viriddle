# Private daily case packs

Upcoming competitive stories, paid evidence, matrices and answers stay outside this public repository. The owner holds the private JSON and generated SQL. Do not import them into `src`, add them to practice fixtures, attach them to public issues, or upload them to public CI artifacts. Ignore rules are a guardrail, not a substitute for reviewing commits.

The original pilot used six-patient November stories with five linked patients and one separate introduction. The validator now supports all story months, three to six related patients within a six-patient roster, and zero to three independent introductions. Cases retain the fictional 1–4 day incubation and symptom-onset infectiousness rules. The brief must state the complete-contact and single-introduction assumptions. Difficulty is an editorial estimate until human playtesting. It is not an empirically calibrated rating.

## Owner workflow

```bash
npm run --silent cases:private -- validate /absolute/path/pilot.private.json
npm run --silent cases:private -- sql /absolute/path/pilot.private.json > /private/path/pilot.private.sql
node scripts/validate-private-packs.mjs /absolute/path/pilot.private.json
```

For variable cluster sizes, `audit.cluster` and `audit.separate` must partition the six patient indices; `separate` is an array (the legacy single-number form remains supported). Independent patients use distinct B, C and D lineages in that order. Supply an explicit `case.objective` whenever the related group has a size other than five; existing deployed clients already render that field. An explicit phylogeny report must state membership in its text, not just its row labels.

Each JSON entry contains `date`, stripped public `case`, six `reports`, `solution`, and private `audit` metadata (`cluster`, `separate`, `snpMatrix`, `difficulty`). The audit metadata is never inserted into public tables. The generator validates the whole pack before emitting any SQL. CLI validation summaries omit source indices and evidence. Failed assertion logs and generated SQL can contain private data: keep owner runs private.

Answer-position variety is checked within the pack and against the existing bank during SQL execution; see [Daily answer variety](ANSWER_VARIETY.md). Repetitive packs are rejected before insertion, including patterns spanning separate uploads.

Validation checks real release dates, unique IDs/dates/names, empty public interviews/contact/genomic arrays, a public-field allowlist, the six original reports (plus an optional explicit `phylogeny` report), symmetric SNP matrices and their displayed text, real month-boundary incubation-window labels, valid encounter dates, incubation-compatible directions, exactly one source able to reach every related patient, and a valid reconstruction with one fewer arrow than related patients. Brief plus report-row text is capped at 650 words; instructions, notes, labels and post-answer explanations are additional. Automated logic checks do not replace editorial review of prose or human playtesting.

The generated SQL inserts future dates in one transaction. An identical rerun is a no-op; a conflicting existing case aborts the entire pack. It never updates cases, attempts, profiles, scores, rules, RLS, migrations or practice data. Both the public snapshot and private reports/solution must match for an existing date to count as identical. Review the generated SQL and target project before executing it through the owner's database connection. This is content scheduling, not a frontend deployment.

`npm run test:private-packs` uses synthetic public data in isolated PostgreSQL. It tests future-case visibility, private-schema isolation, all seven evidence purchases, correct/incorrect answers, score preservation, quote escaping, atomic conflicts and past-date rejection. It never accesses production. Passing a private pack path runs the same checks against that pack locally; do not pass it to public CI.

## Seven-case pilot

Proposed UTC releases follow the existing November 13 sample. Confirm live scheduling separately; this document is not a deployment record.

| Date | Title | Provisional difficulty |
| --- | --- | --- |
| November 14, 2026 | The Last Slide Standing | Easy |
| November 15, 2026 | The Hippo Shipping Manifest | Standard |
| November 16, 2026 | The Verdict Is Adjourned | Standard |
| November 17, 2026 | The Manatee Meeting Minutes | Easy |
| November 18, 2026 | The Night Shift Cut | Challenging |
| November 19, 2026 | The Midnight Accession | Challenging |
| November 20, 2026 | Signal, Not Noise | Challenging |

The stories explore early unrelated illness, direction versus contact degree, planned versus attended meetings, pre-symptom contacts, parallel branches and multiple outside-exposure records. Genomic similarity supports relatedness; the displayed arrows are compatible fictional reconstructions rather than proof of direct transmission.

The SQL exporter adds a separate `phylogeny` report from the supplied laboratory rows when a legacy six-report pack omits it. Existing explicit tree reports are preserved. The deployed database must include the phylogenetic-evidence migration before serving seven-clue investigations.

## Two-week extension audit

The November 2026 audit confirmed that the prior answer-variety PR was merged and GitHub Pages deployed successfully. Two unreleased incubation reports need calendar-label corrections. A new fourteen-case private pack is prepared for November 21 through December 4 (UTC), with distinct stories, multiple cluster sizes, varied contact trees and independently shuffled rosters. The full pack is tested through the existing authenticated gameplay RPCs in isolated PostgreSQL, including seven evidence purchases, correct/wrong answers, scoring, idempotency and rollback. Private narratives, solutions, SQL and exact answer distributions must remain outside this public repository. Automated validation does not replace human playtesting.

Upload status as of November 12, 2026 (UTC): the confirmation flow expired and the reduced upload was interrupted. A subsequent read verified 23 live cases, ending November 20, with zero extension cases inserted. The fourteen new cases and two report corrections remain unapplied. Do not infer production scheduling from the prepared files or passing local tests.
