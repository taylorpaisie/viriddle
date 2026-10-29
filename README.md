# OUTBREAK
React + TypeScript + Tailwind/Vite daily detective prototype.

## Run
npm install
npm run dev
npm run build

## Case architecture
`src/cases.ts` contains typed public patient records and unlockable evidence.
`src/answerKeys.ts` contains separate simulated answer keys and reconstructed trees.
The prototype ships both to the browser: it is not cheat-resistant. Production must move validation and answer keys to a server, enforce one submission by date/player, and atomically deduct evidence costs there.

The America/New_York calendar date deterministically selects a case from a three-case cycle anchored October 2, 2026. The archive intentionally repeats these handcrafted cases. Expand this bank before a public competitive launch. Future generation should verify incubation constraints and intended source, then audit the public clues for ambiguity.

Records are browser-local under outbreak-v1. Daily runs use daily:YYYY-MM-DD keys; demo and archive runs are separate and do not affect statistics. A streak counts consecutive correctly solved daily cases. An unsolved day or an incorrect submission breaks it. All completed daily attempts, including zeros, count in average scores.

Scientific scope: fictional respiratory diseases; infectiousness begins at symptom onset; incubation 1–4 days. Contacts are undirected observations. SNP similarity supports relatedness, not proof of direct transmission. The result tree is the intended simulated history, not a uniquely inferred real-world transmission tree.
