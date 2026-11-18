# Daily roster randomization

`randomizeRoster(entry, order?)` in `scripts/randomize-roster.mjs` is owner-only tooling for complete sealed case snapshots. With no order supplied, it uses a cryptographic Fisher–Yates shuffle. An explicit order is useful for verification. It returns a fresh snapshot and rejects incomplete permutations and explanation-choice cases.

The transformation reorders patients, interview rows and transcripts, outside records, computed windows and genetic matrix rows. It remaps contact endpoints, source and transmission-tree indices, cluster/independent-introduction indices and both axes of the audit SNP matrix. Name-based prose and genomic values remain unchanged. Never shuffle only the frontend roster: the server's selected-patient index must continue to refer to the same person as the evidence.

Use it on private authoring files before release. Run `validatePack` on the result and check `assertAnswerVariety` against neighboring scheduled cases before exporting. Once scheduled, keep the shuffle fixed for all players and reloads. Published cases and cases with attempts must not be reordered. Explanation-choice investigations require a separate policy because their answer index is not a patient index.

`npm run test:private-packs` exercises multiple permutations for every supported related-group size, validates the resulting source independently and checks that named contacts and matrix evidence stay consistent. Duplicate indices and unsupported explanation-choice cases are rejected.

## Verified scheduling update — November 18, 2026 (UTC)

Fourteen additional daily cases are now scheduled for November 21–December 4. The two untouched, previously scheduled future cases received complete roster shuffles. All future games include Darren exactly once and have all seven private evidence reports. Variety checks cover the boundary between existing and newly scheduled cases.

An isolated PostgreSQL rehearsal checked all 23 original snapshots plus the fourteen additions, including exact-match reruns. After uploading in small transactions, a production read verified 37 total cases, 21 unchanged current/past cases, exact agreement with the validated future snapshots and no schedule gaps from November 18 through December 4. Future narratives, answer distributions and payloads remain private. This supersedes earlier notes that the extension was prepared but not uploaded.

These checks prevent broken indices and obvious repeated-position shortcuts. They do not establish calibrated difficulty or replace human playtesting.
