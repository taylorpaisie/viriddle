# Viriddle

Created by **Taylor Paisie**, a data analyst and bioinformatics researcher.

A daily epidemiological detective game: investigate six fictional patients, purchase evidence, and identify the source of a five-person transmission cluster. The game interface and shared results are branded Viriddle.

[Play on Sites](https://outbreak-daily-detective.tinylion32770.chatgpt.site)

## Accounts & onboarding expansion

The seven-step interactive training lab, score simulator, profile interface, ranks, leaderboard screen, optional account dialog, privacy page, and native-share fallback are included. Both hosted versions use Supabase accounts and server-backed daily play. Google sign-in and guest play are enabled; public leaderboard participation remains opt-in. Earlier browser-local scores are not imported.

[Exact Supabase, Google OAuth, redirects, database, and hosting setup](docs/ACCOUNTS_SETUP.md).

- Database schema and RLS: `supabase/migrations/202610290001_outbreak.sql`; five-minute upgrade: `supabase/migrations/202610290002_four_minute_window.sql`.
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
- Correct timed answers earn 50 base points + up to 50 speed points − evidence costs (maximum 100). One speed point drains every 6 seconds. Six evidence options: room booking logs (4), incubation analysis (6), interviews (10), contact tracing (12), outside-exposure checks (14), and sequencing (18). Costs stack and scores cannot fall below zero.
- A 5-minute daily response window, yellow warning at one minute, and coral warning at 30 seconds.
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

The palette and visual states are centralized in `src/neon-lab.css`. Existing layout rules in `src/style.css` and the SVG board use those semantic variables. Selected nodes pulse gently, newly revealed contacts illuminate once, and results fade in; reduced-motion preferences disable these effects. The NEON LAB redesign preserves the 300-second timer, evidence prices, and time-based scoring. The accounts expansion changes the shared reset to midnight UTC and adds optional server-validated play.

### Light and dark appearance

The sun/moon button in the header switches the entire site, including investigations, Friends and shared results. New visitors follow their device preference; choosing either mode saves `viriddle-theme-v1` in browser-local storage, independently of account identity and game progress. Other tabs synchronize the choice. The small initializer in `index.html` applies it before rendering to avoid a flash of the wrong theme. If storage is blocked, switching still works for the current page. `src/themes.css` defines light-mode colors and shared surface tokens; the original dark neon palette remains in `src/neon-lab.css`. Light mode uses darker pink/cyan ink for WCAG AA text contrast. `npm run test:theme` covers initialization, persistence, system preferences, cross-tab updates, blocked storage, progress isolation and palette contrast, and runs with `npm test`.

## Reading the evidence

A free, collapsible evidence field guide is available in the evidence room, tutorial, and Rules & Scoring. It explains every tool, SNP distances, incubation-window checks, separate introductions, and the limits of contact and genomic evidence, using a generic worked example without daily spoilers. Opening the guide does not purchase evidence or change the score.

## Refined Lab presentation

Viriddle pairs the NEON LAB pink/cyan palette with abstract microscopy-inspired cells and undirected contact motifs. The original SVG art has no faces, character poses, question-mark props, or case clues. Soft card corners and friendly copy keep the daily puzzle approachable; typography, button depth, and decorative effects are restrained. `src/PlayfulLab.tsx` contains the artwork and network/cell wordmark; presentation overrides live in `src/playful-lab.css`. Gameplay, the five-minute timer, evidence prices, and the 18-name pool are unchanged.

### Reference mystery: The Mothman Meltdown
The first demo turns the October Cluster into a chaotic cryptid-festival mystery, with a short briefing and no more than 550 words across story and optional evidence. Six first-person accounts, named room bookings, corroborated encounters, and a five-part post-answer debrief support a 3–4 minute session. The five-minute clock, evidence prices, patient rotation, source and transmission tree remain unchanged. Contact detail fields are stripped from connected public fixtures; the expanded reveal is part of the private solution. Existing published server fixtures are not overwritten.

The Viriddle display-name update retains the existing repository and site URLs, database function names, and browser storage keys so saved progress and integrations continue to work.

### Connected build configuration
`config/public-services.ts` supplies the public Supabase URL and publishable key for both static deployments. Environment overrides must be supplied as a pair. Use `VITE_PLAY_MODE=local npm run dev` for the offline sample library. The connected build excludes offline case evidence and answer keys. Google sign-in is active. Fifteen approved sample cases are loaded through November 12, 2026; new case data must be published before that schedule ends. See docs/ACCOUNTS_SETUP.md.


### New case: Before You Arrived

A fictional hospital investigation inspired by the Libyan outbreak’s scientific investigation. Available immediately in Case Archive → Investigate the hospital case, with a five-minute or untimed practice option; scheduled as a known sample daily on November 13, 2026 (UTC). Six explanations replace patient-name hypotheses, and the supported conclusion leaves the individual source unresolved. Results show an evidence timeline without speculative transmission arrows. The other nine cases retain their mechanics, scores and schedule.


### Investigation board and notebook

Patients → Clues → Board → Solve provides one consistent working area on desktop and mobile. The Board combines free symptom dates with purchased contacts and explicitly dated evidence; no answer-key data is used. Specimen collection and result entry have different labels and colors. Pin revealed report rows, mark a hypothesis Possible/Ruled out, and save up to 600 characters of reasoning. Marks never select, exclude, or submit an answer. Notes are browser-local and scoped to the signed-in player, case and practice/daily mode; they do not sync between devices or the two site origins. Hidden practice evidence remains excluded until purchased. Tab switches restore the previous scroll position during the investigation. Scoring, clocks and fixed evidence costs are unchanged.


### Branding kit integration

The supplied primary horizontal PNG is used in the desktop header; a responsive `<picture>` switches to the compact PNG on phones (700px and below). Original PNGs preserve the exact supplied wordmark without requiring an external font. CSS clips transparent padding; the original files are unchanged. Globe SVG/ICO favicons, Apple touch icon and social preview use the kit assets under `public/brand/`. Asset URLs respect the Vite base path; link-preview URLs target the corresponding Sites or GitHub Pages origin. Optional `VITE_PUBLIC_SITE_URL` overrides that origin for a future custom domain. Existing theme variables, accounts and gameplay rules are untouched.

### Case-closed experience

The results screen now leads with a verdict, the unchanged awarded score and a spoiler-free sharing card. Sharing includes the correct site URL, works through native sharing or clipboard, and offers selectable text if clipboard access is unavailable. Three guided deduction steps use only the completed case's returned solution; the full reconstruction and scientific caveats remain available in an accessible disclosure. The return panel shows the UTC countdown, current participation streak and practice navigation. Practice is clearly labeled. Existing scores, timers, evidence costs, authentication and daily selection are unchanged. No feedback/analytics collection was added.

### Shareable result links

“Copy result” copies the spoiler-free scorecard plus its link; “Copy result link” copies just the URL. Native sharing sends the message and URL separately. Links open a read-only, no-login shared-card landing page with a play button. The fragment contains only allowlisted score fields, case number/date, elapsed time and mode; no patient identities, answer key, account ID or notebook text. Shared cards are player-supplied previews, not server-verified records, and never write to official scores, streaks or leaderboards. Invalid links show a recoverable message. Existing Google callbacks and the normal game route remain intact.

Mobile result sharing prioritizes the native share sheet, 52px primary actions and 48px copy targets. The large duplicate score is hidden on phones, while the scorecard and breakdown remain readable. Copy-result and copy-link actions stay side by side on common phone widths, with a stacked fallback on very narrow displays. Shared links use a compact mobile landing page and a clear play button; no login is needed to view a card.

Darren is a recurring fictional comic character. `src/darrenStory.ts` adds setting-specific absurd side plots whenever the name rotation includes Darren; personal asides are explicitly separate from exposure evidence. Connected fixtures receive the same presentation without changing stored answers or health records. New attempts have five minutes; existing official attempts keep their original duration and recorded scores.

### The Darren Files
Case Archive now offers thirteen noncompetitive examples, all with a fictional Darren. Three easy examples use three patients and two encounters: The Quackovirus Press Conference, The Bacterial Wedding, and The PCR Machine Wants a Lawyer. Standard demos keep their original indices and answers. `practiceFixtures.ts` assembles offline authoring content; only `practiceCatalog.ts` labels enter the connected bundle. `generate-practice-sql.ts` uploads stripped public records and sealed practice reports/solutions to `private.practice_cases`, independently of daily scheduling. The authenticated, rate-limited practice RPC does not create competitive attempts. Five-minute or untimed practice is available.

Practice comedy stays rooted in microbiology: fictional respiratory viruses, a fictional respiratory bacterium, lab outreach, viral replication, and microbial exhibits. The stated incubation and infectiousness rules are invented teaching assumptions, not clinical claims about real pathogens. Props and laboratory mishaps are not additional transmission routes.

## Private friend leagues (feature branch)

See [PRIVATE_LEAGUES.md](docs/PRIVATE_LEAGUES.md) for the league API/security design, isolated PostgreSQL and React tests, pending staging/production migration steps, and the two-account smoke-test checklist. This branch does not deploy or apply database changes automatically.


### Guest friend leagues

Friend leagues now accept browser-backed guest sessions. Open a valid invitation, pick a display name, and explicitly join; Google is optional to preserve identity across devices. Apply `supabase/migrations/20261030160736_guest_friend_leagues.sql` after the initial league migration before deploying this frontend. Guest scores remain excluded from public leaderboards unless a permanent identity is linked and public sharing is enabled. See `docs/PRIVATE_LEAGUES.md`.

### Casefile layout

The mobile-first Casefile entrance keeps the neon pink/cyan palette, adds a daily numbered dossier with one primary open action, and moves illustrative clues into an optional spoiler-free preview. The shared finish carries folder-style edges through briefings, patients, evidence and results. No timing, scoring, evidence prices, authentication or league rules change. Local phone QA is available at `tests/casefile-phone-preview.html` (run with `VITE_PLAY_MODE=local`; `?width=320` tests the narrow layout).


### Viriddle spelling correction

The public game name is **Viriddle**. Header/mobile/share wordmarks and social previews use corrected vector artwork with the existing globe motif. Page metadata, result scorecards, invitation copy and tutorial text use the corrected spelling. Repository/site URLs, player/database identities, result-link encoding and browser storage keys remain unchanged for compatibility.


## Navigation and clue reading

Phones have persistent Today / Practice / Friends / More destinations outside investigations. Inside a case, a dedicated four-step dock (Patients / Clues / Board / Answer) keeps the timer, potential score and next action within reach. Desktop uses the same destinations and numbered investigation steps. More uses the existing accessible dialog and supports Escape and focus restoration. Case rules and score arithmetic can be expanded without taking over the investigation screen.

The clue lab separates its shop from My reports. A newly purchased report opens only after the unlocked evidence state confirms the purchase; reopening reports is free. Only purchased categories enter the report picker, including in local mode where authoring fixtures contain locked data. Pins still feed the existing notebook. Answer submission still goes through the original confirmation action. An in-memory Resume/Review banner on Home returns to the currently loaded case without fetching another or restarting its clock. Reload behavior and server attempt limits remain unchanged.

Practice initially shows the three short cases; All practice cases keeps the full library available. These are presentation changes shared by local and connected apps, with no database, case scheduling, timer, scoring, price, authentication, sharing, league, or theme-preference changes. `npm run test:navigation` covers clue gating, report switching, free reopening, pin/board routes, run-state isolation, answer confirmation controls, global destinations and menu dismissal; it runs with `npm test`.
