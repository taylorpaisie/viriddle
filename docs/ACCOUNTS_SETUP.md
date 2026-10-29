# Enable OUTBREAK accounts and official daily play

The deployed site intentionally remains in local mode until both public Supabase build variables are set. Google, cloud saves, and live leaderboards are **not configured or verified** by this code change. The UI states that clearly. No credentials have been created or supplied.

## 1. Separate staging project

Create a Supabase development project, then a production project when the checks below pass. Keep database passwords, service-role/secret keys, and Google client secrets out of this repository, GitHub Pages, and all `VITE_` variables.

In the Supabase SQL editor, apply `supabase/migrations/202610290001_outbreak.sql`. Alternatively, link the project using the Supabase CLI and run `supabase db push`. Keep only `public` in the exposed Data API schemas; **never expose `private`**. RLS is enabled on every public player/case/attempt/event table. Browser roles have SELECT-only access scoped by RLS; writes and secret reads go through carefully scoped database functions.

The trusted backend is transactional PostgreSQL RPC (`SECURITY DEFINER` functions with an empty search path), an equivalent to an Edge Function for these operations. It validates the authenticated UUID, case date, start time, purchases, selection, submission, and score. It never accepts a client score, deadline, elapsed time, price, result, or player ID.

## 2. Auth settings

In Authentication settings:

1. Enable anonymous sign-ins.
2. Enable manual identity linking.
3. Enable the Google provider after completing step 3.
4. Use PKCE redirects. The SDK persists and refreshes the browser session. These tokens identify requests; they are not the source of official results.
5. Configure Auth rate limits appropriate to your audience. Enable Cloudflare Turnstile CAPTCHA for anonymous creation before public competitive launch. Set its secret only in Supabase and its public site key in `VITE_TURNSTILE_SITE_KEY`. The optional widget appears in the guest dialog; direct daily play opens that dialog only when a challenge is needed.

A guest uses `signInAnonymously()`. Upgrading uses `linkIdentity({provider:'google'})`, preserving the same Supabase UUID. Do not implement an automatic email-based merge. A conflicting Google identity produces an error and keeps records separate. The return handler checks the expected guest UUID and reports a mismatch rather than merging data. A player who wants a different existing account should use that account in a separate browser session; cross-account migration needs a future explicitly reviewed server workflow.

## 3. Google OAuth

In Google Cloud Console, create a project and an OAuth client of type **Web application**. Configure Google Auth Platform branding/audience, with a support contact and the privacy-policy URL for your hosted site. While Google is in testing mode, add your tester accounts.

Authorized JavaScript origins (add the ones you actually use):

- `https://taylorpaisie.github.io`
- `https://outbreak-daily-detective.tinylion32770.chatgpt.site`
- Your localhost development origin if testing there.

Authorized redirect URI:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

Copy the Google client ID and client secret into **Supabase’s Google provider settings only**. Never add the Google secret to a frontend environment variable.

## 4. Supabase redirect allowlist

Set the Site URL to your primary deployment, for example:

```text
https://taylorpaisie.github.io/viriddle/
```

Add exact Additional Redirect URLs for each deployment you use:

```text
https://taylorpaisie.github.io/viriddle/
https://outbreak-daily-detective.tinylion32770.chatgpt.site/
http://localhost:5173/
```

Use a separate Supabase project and exact URL for staging. Add a custom domain to both provider settings when you adopt one. The code constructs the callback from the current origin and Vite base path, so GitHub’s `/viriddle/` path is preserved. No SPA callback route or GitHub Pages rewrite is needed.

## 5. Publish daily case data privately

Official cases contain a safe public briefing, separately sealed evidence reports, and a private solution. Nothing unrevealed is returned by the official API. New official cases unlock at **00:00 UTC** and one unique attempt is allowed per player/case.

For staging fixtures only:

```bash
npm run --silent cases:sql -- 2026-10-29 30 > staging.private.sql
```

Run the resulting SQL through the project SQL editor or your trusted database connection. It preserves the existing date-to-template schedule and rotating 18-name pool. It refuses to overwrite existing dates. The generated file contains answers; `.gitignore` excludes `*.private.sql`. Never put it in `public/`, `dist/`, or frontend assets.

**Competitive launch requires fresh private cases.** The nine existing example templates and their answers are already public and repeat on a known schedule. Removing them from the connected JS bundle cannot make that published knowledge secret. Use the fixture generator to test the integration, then author fresh daily records through a private backend pipeline, following the same `public.daily_cases` + `private.case_secrets` structure. You can retain the name rotation, scientific rules, timing, prices, and scoring. Do not claim the sample rotation provides a cheat-resistant competition.

An official safe `public_data` object follows `src/model.ts`’s `Case` shape with `patients[].interview=''`, `contacts=[]`, `genomics=[]`, and no nameMap/answer. Private `reports` keys are the six evidence IDs; each has `title`, `rows:[{label,text}]`, and optional `note`. Interviews additionally have `interviews:string[]`; contacts have `contacts:[number,number,number][]`; genomics has `genomics:string[]`. Private `solution` is `{source:number,tree:[number,number][],explanation:string}` with display names already substituted.

Past-case replay becomes available 150 seconds after the UTC date ends, protecting attempts started just before midnight. It returns the reconstruction for noncompetitive local practice and writes no official attempts. Connected mode uses this archive and the separate tutorial practice case; the original nine instant demos remain available in unconfigured local mode. Current/future daily solutions cannot be obtained through the replay endpoint.

## 6. Expired and interrupted attempts

Enable `pg_cron` in Database > Extensions, then run `supabase/cron.sql` once. The job finalizes stale attempts every minute and prunes old rate-limit buckets. An attempt is always scored expired at its **150-second deadline**, regardless of when the cron job runs. It becomes score 0, elapsed 150, and status `timed_out`.

An in-flight investigation remains resumable across a midnight refresh, then the next daily case can be opened when that attempt closes. Resume, action, and profile RPCs also finalize the player’s expired attempts immediately, so refreshing, closing a tab, or disabling JavaScript cannot restart or extend the timer. Clock display estimates use the server clock; final timing is determined inside the server transaction. If a request arrives after the deadline, it earns zero even if the client was showing time remaining. Allow a little margin when you confirm.

## 7. Build configuration

Copy `.env.example` to `.env.local` for local development. Set:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
VITE_TURNSTILE_SITE_KEY=YOUR_PUBLIC_TURNSTILE_SITE_KEY_IF_ENABLED
VITE_BASE_PATH=/
```

Both Supabase values must be present together. The publishable key is designed to be public; RLS and restricted RPC grants protect the data. No service-role key belongs here. Restart the Vite dev server after changing configuration.

**GitHub Pages:** Settings > Secrets and variables > Actions > Variables: add `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and optionally `VITE_TURNSTILE_SITE_KEY`. The workflow supplies them at build time and uses `/viriddle/` automatically. Run the deployment workflow again. These are build-time variables; adding them without rebuilding changes nothing.

**Sites:** the current site is a static Vite build. Supply the same public values to the build environment before packaging and deploying. Runtime-only environment variables do not rewrite a previously built static JS bundle. Do not change hosting audience or require a site-wide login; the game handles optional accounts internally.

The build selects `connectedApp.tsx` only when both values exist. It excludes the local case library and answer keys. `main.tsx` retains the local prototype when they are absent. They are separate build graphs, not a client toggle that exposes both modes.

## 8. Leaderboards, profiles, and privacy

Display names default to a random `Investigator-xxxxxxxx`, never a Google name/email/photo. Leaderboard participation is opt-in, off by default; anonymous scores stay private until the same identity becomes permanent. Daily ordering: score descending, elapsed ascending. All-time ordering: total points descending, total elapsed ascending. Exact ties use earliest completion, then stable UUID. Rank labels use lifetime completed investigations; titles confer no gameplay benefits.

Rows are limited to 25 per page, plus a separate own-position result. Public boards return only the selected display name, aggregate game metrics, and title inputs. Private histories and evidence events remain owner-only. The database stores no Google email in game tables. Private friend-group tables are reserved without exposing a membership API.

Tutorial completion is cached locally and saved on the connected player record. Choosing Skip does not pretend the tutorial was completed. Participation streaks count completed daily investigations, including unsuccessful ones. Prototype historic scores are never uploaded as official results; there is no untrusted import path. Local profile statistics label their origin clearly.

Review the in-app Privacy page against your actual service configuration and retention practice before launch. The creator handles deletion after private identity verification; removing the auth user cascades through their game records. Do not ask users to publish identifiers in public GitHub issues.

## 9. Test before enabling production

```bash
npm ci
npm test
npm run test:connected
npm run build
npm run dev
```

Automated tests run real PostgreSQL semantics through PGlite with stubbed Supabase auth claims. They exercise the migration, RLS isolation, private solution/evidence access, repeated starts/purchases/submissions, expiration, wrong answers, profiles, tutorial persistence, and public-board filtering. They do not substitute for a real Supabase/Google OAuth test.

Use a staging project and two browser profiles to verify:

- New visitor plays as anonymous guest with no registration; CAPTCHA succeeds if enabled.
- Reload an active attempt; start/deadline and purchased reports remain unchanged.
- Purchase each category twice (also concurrent tabs); one charge and one purchase event.
- Submit twice/concurrently; one final result. Manipulating local storage/clock cannot change the server result.
- Close for over 150 seconds and resume; score 0. Confirm exactly at/after the boundary; score 0.
- Finish tutorial, sign out/in, and verify the completion marker follows the player. Training must create no daily attempt.
- Link a fresh Google identity to a guest; UUID and history stay the same.
- Link an already-used Google identity; no silent merge, no overwritten history.
- Sign in on a second device; profile, statistics, and current attempt restore.
- Check all RLS paths with two UUIDs, anon and expired tokens. Calling private functions/tables and writing official results directly must fail.
- Opt in with a chosen nickname; check daily and all-time boards, pagination, own-position, rank title, and no Google metadata.
- On a real phone, test tutorial, modal keyboard/focus, native share sheet, clipboard/manual fallback, small screens, and reduced motion.

## 10. Abuse and scaling

The database serializes mutations with row locks, has uniqueness constraints, and limits each player to 90 accepted requests per minute. Auth creation rate limits and optional Turnstile address identity farming; anonymous IDs cannot establish one human per day. Only permanent, opted-in accounts appear on leaderboards. These measures are appropriate for a small prototype, not proof against determined cheating. Add monitoring, edge/IP-level limits, abuse review, and precomputed leaderboard aggregates as usage grows. The current board scans should be reviewed under production-sized loads.

## Primary references

- https://supabase.com/docs/guides/auth/auth-anonymous
- https://supabase.com/docs/reference/javascript/auth-linkidentity
- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/database/functions
