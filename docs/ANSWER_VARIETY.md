# Daily answer variety

A production audit found that the first eleven past daily cases all placed the source second in symptom-onset order, even though the source's roster position varied. Renaming or shuffling patients cannot fix this shortcut.

On November 9, 2026, six untouched, unreleased daily snapshots were revised in production. The unrelated infection's timing and its interview, outside-exposure record and computed incubation window were updated together. One briefing was revised to fit the new timeline. All intended source identities, valid transmission arrows, genomic records, publication times, current/past case snapshots and existing attempts were preserved. An isolated PostgreSQL rehearsal checked all eleven upcoming cases and atomic rollback on a conflicting edit; a subsequent production read confirmed the six revisions and unchanged solutions. Private snapshots and SQL stay outside this repository.

## Authoring and scheduling checks

Both `scripts/private-case-pack.mjs` and `scripts/generate-case-sql.ts` use `scripts/answer-variety.mjs`. Authoring rejects four consecutive answers with the same symptom-onset position or roster position, or a position winning six of seven cases. Symptom ties are treated as a tied group; unresolved outcomes are not patient-position answers.

The exported SQL repeats this check against the existing case bank, inside the same transaction as the insertions. This catches patterns across small packs and neighboring releases, including already scheduled later cases. Both exporters take the same transaction advisory lock so concurrent uploads through these tools cannot bypass the check. Any failure rolls back the whole upload. Past windows are grandfathered; new cases must break a dominant old pattern. The SQL creates no database objects or public endpoints and returns no answer positions.

Run `npm run test:variety` and `npm run test:private-packs` before scheduling. The legacy sample rotation intentionally fails the variety check for long exports; write genuinely varied cases rather than bypassing the check or rotating names. Do not rewrite published cases to make a check pass.

These are editorial rejection thresholds, not a release pattern to follow or a guarantee against every shortcut. Under symptom-onset infectiousness, a single-introduction five-person chain with one unrelated infection still constrains the source to an early onset. Human review must also vary the investigation model, outside-exposure leads, evidence needed, and justified unresolved conclusions. Broader models need explicit rules and their own solution validation. Direct SQL uploads outside these tools do not receive automatic protection.
