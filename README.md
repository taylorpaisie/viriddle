# Viriddle

A daily epidemiological detective game: investigate six fictional patients, unlock evidence, and identify the source of a connected transmission cluster.

The playable prototype is currently branded **OUTBREAK**. This repository contains its original version and the latest mobile-friendly, high-contrast Ultraviolet version in separate commits.

**[Play the live prototype](https://outbreak-daily-detective.tinylion32770.chatgpt.site)**

## Run locally

Use Node.js 22 or newer and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. For a production build:

```bash
npm run build
```

The generated `dist/` directory can be deployed to static hosting. Creating or updating this GitHub repository does not automatically update the existing Sites deployment.

## Features

- Three handcrafted fictional outbreaks on a deterministic daily rotation.
- A shared daily case selected by the America/New_York calendar date.
- Patient records, symptom timeline, and an interactive SVG contact network.
- Interviews (10 points), contact tracing (12), and sequencing (18).
- One confirmed submission per daily case on the same browser; correct answers earn remaining points, incorrect answers earn zero.
- Browser-local progress, daily scores, streaks, and evidence-use statistics.
- Separate demo and archive runs that do not affect daily statistics.
- Spoiler-free clipboard sharing with a manual-copy fallback.
- Mobile Patients / Evidence / Solve navigation and a persistent score/action bar.
- A high-contrast Ultraviolet palette with keyboard controls and reduced-motion support.

## Project layout

| Path | Purpose |
| --- | --- |
| `src/main.tsx` | React components, game flow, scoring, and local persistence |
| `src/style.css` | Desktop and mobile styling |
| `src/cases.ts` | Typed public case data, evidence, and daily scheduling |
| `src/answerKeys.ts` | Prototype-only answer keys and simulated transmission trees |
| `vite.config.ts` | Vite and Tailwind configuration |
| `package-lock.json` | Reproducible npm dependency versions |

## Daily cases and statistics

The date selects one of three sample cases in a repeating cycle anchored October 2, 2026. The archive repeats those same handcrafted cases; the prototype does not yet generate unique daily cases.

Records are stored in this browser under `outbreak-v1`. Daily runs use `daily:YYYY-MM-DD` keys; demo and archive runs use separate keys. Consecutive correctly solved daily cases count toward a streak. Missed days or incorrect submissions break the streak. All completed daily attempts, including zeros, count toward average score.

Progress is not synchronized across devices. Browser storage can be cleared or modified, so this prototype does not enforce competitive integrity.

## Answer validation and scientific scope

**Answer keys currently ship in the browser bundle.** Their separate source module is architectural organization, not secrecy. Before a competitive launch, move answer keys and validation to a server, enforce submissions there, and store evidence purchases and results atomically.

All patients, pathogens, and transmission histories are fictional. In these puzzles, infectiousness begins at symptom onset and incubation lasts 1–4 days. Contact connections are undirected observations; result arrows show the intended simulated history.

Genetic similarity supports relatedness but does not prove direct transmission. Real-world evidence rarely establishes a unique transmission tree.

## Next development steps

1. Expand the case bank and validate timing constraints and clue ambiguity.
2. Move final-answer validation and competitive records to a backend.
3. Test on physical iOS and Android devices.
4. Select a permanent domain and configure deployment from this repository.

Installed dependencies, generated builds, environment files, and Sites-specific configuration are excluded from version control.
