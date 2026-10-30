# Virriddle

Created by **Taylor Paisie**, a data analyst and bioinformatics researcher.

A daily epidemiological detective game: investigate six fictional patients, purchase evidence, and identify the source of a five-person transmission cluster. The game interface and shared results are branded Virriddle.

[Play on Sites](https://outbreak-daily-detective.tinylion32770.chatgpt.site)

## Accounts & onboarding expansion

The seven-step interactive training lab, score simulator, profile interface, ranks, leaderboard screen, optional account dialog, privacy page, and native-share fallback are included. Both hosted versions use Supabase accounts and server-backed daily play. Google sign-in and guest play are enabled; public leaderboard participation remains opt-in. Earlier browser-local scores are not imported.

[Exact Supabase, Google OAuth, redirects, database, and hosting setup](docs/ACCOUNTS_SETUP.md).

- Database schema and RLS: `supabase/migrations/202610290001_outbreak.sql`; four-minute upgrade: `supabase/migrations/202610290002_four_minute_window.sql`.
- Transactional server scoring and event ledger: the same migration’s restricted RPCs.
- Stale-attempt cleanup job: `supabase/cron.sql`.
- Public environment example: `.env.example`.
- Secure connected app: `src/connectedApp.tsx`; local prototype: `src/main.tsx`.
- Shared investigation UI: `src/gameComponents.tsx`; tutorial/accounts/profiles: `src/community.tsx`.
- Offline fixtures only: `npm run --silent cases:sql -- YYYY-MM-DD 30 > staging.private.sql`.
- Fresh private cases are required for a competitive launch: existing sample templates and their solutions are already public. See setup instructions.

Connected builds exclude the offline case library and answer keys. Local historical scores remain local and cannot be imported as validated competitive results. Connected guests can link Google using the same UUID; duplicate Google identities are not silently merged. Leaderboards are opt-in and never publish Google names or email addresses.

## Local development

Use Node.js 22 or newer (Node.js 24 is used in CI).

```bash
npm ci
npm run dev
npm test
npm run test:connected
npm run build
```

Vite prints the local development URL. The production output is `dist/`.

## Features

- Nine handcrafted cases with linear chains, branching events, shared contacts, and unrelated introductions.
- Fictional patient names rotate deterministically through Darren, Carla, Melanie, Andrea, Lucy, Brittany, Nídia, Luis, Selim, Nate, Cherie, Bob, Bret, Luke, Joicy, Ben, Anthony, and Hamilton. Six appear in each daily case; examples use different combinations.
- Deterministic daily scheduling with midnight UTC reset; original case-to-date and name rotation rules are retained.
- Interactive patient records, symptom timelines, SVG contact boards, and scientific evidence.
- Correct timed answers earn 50 base points + up to 50 speed points − evidence costs (maximum 100). One speed point drains every 4.8 seconds. Six evidence options: room booking logs (4), incubation analysis (6), interviews (10), contact tracing (12), outside-exposure checks (14), and sequencing (18). Costs stack and scores cannot fall below zero.
- A 4-minute daily response window, yellow warning at one minute, and coral warning at 30 seconds.
- Incorrect answers and expired windows earn zero. Untimed practice uses 100 base points minus evidence costs, without a speed bonus. Results and shared cards show the time and earned bonus. Completed historical scores are preserved.
- The deadline persists across navigation and reloads. Demo and archive cases offer optional untimed practice.
- Browser-local completion records, scores, streaks, statistics, and spoiler-free sharing.
- Mobile Patients / Evidence / Solve navigation with a persistent clock, score, and next action.
- Readable 16px clue text, midnight navy surfaces, NEON LAB electric pink actions with neon cyan evidence highlights, and an About page with creator credits.

## Case data and scientific scope

`src/cases.ts` contains public case evidence; `src/answerKeys.ts` contains the prototype answer keys and simulated trees. `src/evidenceDetails.ts` contains public corroborating records and computed exposure-window/booking summaries; it does not import answer keys. `src/gameRules.ts` contains clock and scoring calculations. `scripts/validate-cases.ts` checks every simulated tree, incubation window, historical schedule, and timer boundary.

Dates before October 30, 2026 retain the original three-case rotation, preserving existing daily results. From October 30, the expanded nine-case rotation begins with The Midnight Rehearsal. All nine cases are immediately available in the demo laboratory.

All patients, pathogens, and transmission histories are fictional. Incubation is 1–4 days; infectiousness starts at symptom onset. Genetic similarity supports relatedness, but does not prove direct transmission. Contact links are undirected observations; result arrows show the intended simulation rather than a uniquely established real-world chain.

## Local persistence and prototype limits

Progress is stored under `outbreak-v1` in localStorage. Daily, demo, and archive runs use separate keys. Stats include daily completions only, including incorrect and expired cases. Browser storage does not synchronize across devices and can be cleared or edited.

**Unconfigured local builds include the sample answer keys.** They are noncompetitive prototypes. Connected builds exclude those modules and validate answers, evidence, deadlines, and submissions in restricted Supabase database functions. Online operation still requires the setup guide and a real project. The existing repeated public samples are staging fixtures, not a fresh competitive case bank.

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
- Configure and test the included Supabase/Google integration in staging, then enable production.
- Choose a permanent domain and consolidate production hosting.

## NEON LAB theme

The palette and visual states are centralized in `src/neon-lab.css`. Existing layout rules in `src/style.css` and the SVG board use those semantic variables. Selected nodes pulse gently, newly revealed contacts illuminate once, and results fade in; reduced-motion preferences disable these effects. The NEON LAB redesign preserves the 240-second timer, evidence prices, and time-based scoring. The accounts expansion changes the shared reset to midnight UTC and adds optional server-validated play.

## Reading the evidence

A free, collapsible evidence field guide is available in the evidence room, tutorial, and Rules & Scoring. It explains every tool, SNP distances, incubation-window checks, separate introductions, and the limits of contact and genomic evidence, using a generic worked example without daily spoilers. Opening the guide does not purchase evidence or change the score.

## Refined Lab presentation

Virriddle pairs the NEON LAB pink/cyan palette with abstract microscopy-inspired cells and undirected contact motifs. The original SVG art has no faces, character poses, question-mark props, or case clues. Soft card corners and friendly copy keep the daily puzzle approachable; typography, button depth, and decorative effects are restrained. `src/PlayfulLab.tsx` contains the artwork and network/cell wordmark; presentation overrides live in `src/playful-lab.css`. Gameplay, the four-minute timer, evidence prices, and the 18-name pool are unchanged.

### Reference mystery: The Mothman Meltdown
The first demo turns the October Cluster into a chaotic cryptid-festival mystery, with a short briefing and no more than 550 words across story and optional evidence. Six first-person accounts, named room bookings, corroborated encounters, and a five-part post-answer debrief support a 3–4 minute session. The four-minute clock, evidence prices, patient rotation, source and transmission tree remain unchanged. Contact detail fields are stripped from connected public fixtures; the expanded reveal is part of the private solution. Existing published server fixtures are not overwritten.

The Virriddle display-name update retains the existing repository and site URLs, database function names, and browser storage keys so saved progress and integrations continue to work.

### Connected build configuration
`config/public-services.ts` supplies the public Supabase URL and publishable key for both static deployments. Environment overrides must be supplied as a pair. Use `VITE_PLAY_MODE=local npm run dev` for the offline sample library. The connected build excludes offline case evidence and answer keys. Google sign-in is active. Fifteen approved sample cases are loaded through November 12, 2026; new case data must be published before that schedule ends. See docs/ACCOUNTS_SETUP.md.


### New case: Before You Arrived

A fictional hospital investigation inspired by the Libyan outbreak’s scientific investigation. Available immediately in Case Archive → Investigate the hospital case, with a four-minute or untimed practice option; scheduled as a known sample daily on November 13, 2026 (UTC). Six explanations replace patient-name hypotheses, and the supported conclusion leaves the individual source unresolved. Results show an evidence timeline without speculative transmission arrows. The other nine cases retain their mechanics, scores and schedule.
