# Viriddle / OUTBREAK

Created by **Taylor Paisie**, a data analyst and bioinformatics researcher.

A daily epidemiological detective game: investigate six fictional patients, purchase evidence, and identify the source of a five-person transmission cluster. The current game interface is branded OUTBREAK.

[Play on Sites](https://outbreak-daily-detective.tinylion32770.chatgpt.site)

## Local development

Use Node.js 22 or newer (Node.js 24 is used in CI).

```bash
npm ci
npm run dev
npm test
npm run build
```

Vite prints the local development URL. The production output is `dist/`.

## Features

- Nine handcrafted cases with linear chains, branching events, shared contacts, and unrelated introductions.
- Fictional patient names rotate deterministically through Darren, Carla, Melanie, Andrea, Lucy, Brittany, Nídia, Luis, Selim, Nate, Cherie, and Bob. Six appear in each daily case; examples use different combinations.
- Deterministic daily scheduling using the America/New_York calendar date.
- Interactive patient records, symptom timelines, SVG contact boards, and scientific evidence.
- Correct timed answers earn 50 base points + up to 50 speed points − evidence costs (maximum 100). One speed point drains every 3 seconds. Six evidence options: room booking logs (4), incubation analysis (6), interviews (10), contact tracing (12), outside-exposure checks (14), and sequencing (18). Costs stack and scores cannot fall below zero.
- A 2½-minute daily response window, amber warning at one minute, and pink warning at 30 seconds.
- Incorrect answers and expired windows earn zero. Untimed practice uses 100 base points minus evidence costs, without a speed bonus. Results and shared cards show the time and earned bonus. Completed historical scores are preserved.
- The deadline persists across navigation and reloads. Demo and archive cases offer optional untimed practice.
- Browser-local completion records, scores, streaks, statistics, and spoiler-free sharing.
- Mobile Patients / Evidence / Solve navigation with a persistent clock, score, and next action.
- Readable 16px clue text, charcoal surfaces, Signal Orange accents with cyan evidence highlights, and an About page with creator credits.

## Case data and scientific scope

`src/cases.ts` contains public case evidence; `src/answerKeys.ts` contains the prototype answer keys and simulated trees. `src/evidenceDetails.ts` contains public corroborating records and computed exposure-window/booking summaries; it does not import answer keys. `src/gameRules.ts` contains clock and scoring calculations. `scripts/validate-cases.ts` checks every simulated tree, incubation window, historical schedule, and timer boundary.

Dates before October 30, 2026 retain the original three-case rotation, preserving existing daily results. From October 30, the expanded nine-case rotation begins with The Midnight Rehearsal. All nine cases are immediately available in the demo laboratory.

All patients, pathogens, and transmission histories are fictional. Incubation is 1–4 days; infectiousness starts at symptom onset. Genetic similarity supports relatedness, but does not prove direct transmission. Contact links are undirected observations; result arrows show the intended simulation rather than a uniquely established real-world chain.

## Persistence and prototype limits

Progress is stored under `outbreak-v1` in localStorage. Daily, demo, and archive runs use separate keys. Stats include daily completions only, including incorrect and expired cases. Browser storage does not synchronize across devices and can be cleared or edited.

**Answer keys ship in the frontend bundle.** Source-module separation does not hide them. Production should validate answers, evidence purchases, submissions, and deadlines server-side before offering competitive records. Cases currently repeat rather than being generated daily.

## Deployment

The GitHub Pages workflow installs dependencies, validates the cases, builds the app, and publishes only `dist/`. Its actions use Node.js 24-compatible runtimes. `VITE_BASE_PATH` configures the project subdirectory (for this repository, `/viriddle/`). For a custom domain or root-hosted deployment, use `/` instead.

```bash
# Optional local project-path build
VITE_BASE_PATH=/viriddle/ npm run build
```

The Sites deployment is separate and is updated through Sites, not by this GitHub workflow. Installed dependencies, generated output, environment files, and Sites-specific configuration should be excluded from the GitHub repository.

## Next steps

- Test on physical iOS and Android devices.
- Add a larger audited case bank and a case-generation pipeline.
- Implement server-side answer and deadline validation.
- Choose a permanent domain and consolidate production hosting.
