# Sequencing report tree

Purchased Genomic Sequencing reports show a schematic unresolved lineage tree above the original findings. Patient labels and lineage membership come only from the purchased report text and the case's public patient names. The diagram does not use source solutions, transmission arrows, contacts or onset dates.

Existing fixtures provide lineage groups and partial SNP summaries, not full alignments or a complete distance matrix. Members of a lineage are displayed as an unresolved group; separate lineages remain labeled as distinct groups. Branch lengths have no SNP or time scale, and no root or infection direction is inferred. Reports without named sequence groups show an explanation rather than a fabricated tree. Exact SNP statements remain in the original laboratory text.

Both connected Clue Lab reports and local reports use the same renderer. Hosted reports already contain the necessary text, so this frontend change needs no database migration. Existing sequencing prices, purchase confirmation, and evidence gating remain intact. This reuses the existing phylogenetic evidence renderer; the separate phylogeny clue remains supported.

`npm run test:navigation` checks every current practice fixture's labels, unknown-report fallback, locked-report exclusion, unlocked rendering and absence of directional arrows. Production connected-bundle checks continue to verify that offline case answers are excluded.
