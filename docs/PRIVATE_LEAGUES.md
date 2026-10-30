# Private friend leagues v1

Initial league release merged in PR #2. The first production migration was applied on October 30, 2026.

## Guest invitation update

`20261030160736_guest_friend_leagues.sql` removes only the Google requirement from the private player guard. Any real Supabase player session, including an anonymous browser identity, can create/join/manage their own leagues. Unauthenticated API callers still have preview-only access. Existing owner/member checks, token expiry/revocation, rate limits, spoiler gates and official-attempt uniqueness are unchanged. No tables, memberships, results or daily rules are rewritten.

Opening an invite does not create a session or membership. The user picks a validated display name and explicitly taps **Join league**; the client reuses the existing player session or starts an anonymous session, saves only that player’s display name (without changing public opt-in), then redeems the invitation. Existing CAPTCHA requirements apply to new anonymous sessions. First guest creation preserves the join form; account switches clear stale league state.

Google is optional. Guest access lives in one browser and can be lost after clearing data, signing out or changing devices. Linking the same identity preserves its membership/results; existing different Google identities are not merged. Guest identity churn can create multiple accounts; league/account limits are per player rather than a guarantee of one human per membership. Owners can remove duplicates and rotate/revoke links.

Production backend status: the guest guard migration was applied on October 30, 2026. A rollback-only SQL smoke test used two existing anonymous identities with no official attempts; creation, joining, duplicate joining, membership ACLs, hidden Today, weekly standings, leaving, owner-only revocation and deletion passed without changing official attempt counts. No test membership or profile changes were retained. Privileged-helper execution remains revoked from public/anon/authenticated roles; existing security-advisor findings were reviewed with no new categories. Phone fixture verified at 320px with no horizontal scrolling. Real fresh-browser Auth/CAPTCHA and Google linking still need a manual two-device smoke test.

Release order for this update: apply only the new migration to the existing league-enabled database, verify anonymous-member ACLs and invitations, then publish the frontend. Do not rerun historical migrations. The expanded isolated PostgreSQL tests exercise all score/spoiler/UTC/owner rules with an anonymous member, plus guest league creation and same-ID Google linking. UI tests cover guest joining, names, CAPTCHA gating, failed session creation and optional Google return.

## What this adds

- Friends entry on the home screen and navigation; Player-session league creation, owner membership, member lists, leaving, owner removal and confirmed deletion.
- Seven-day bearer invitations. Two random UUIDv4 values supply 244 random bits; only the SHA-256 token hash is stored. Generating a new invitation replaces the previous one. Revocation/deletion invalidates links. Keep invitation URLs private.
- Public preview returns only availability and the league name. Explicit Join is required, including after Google sign-in. Joining the same league twice is idempotent.
- `#friends`, `#league=<uuid>`, and `#league-invite=<token>` work under the actual deployment base path. Pending invitations live in same-tab session storage for up to one hour while Google redirects back to the existing base URL. An explicit shared-result or auth route wins over an older stored invitation. No auth tokens or callback query parameters are copied into invitation URLs.
- Today / Monday–Sunday UTC standings from existing `public.daily_attempts`, joined to daily cases and current league memberships. No league score table, copied scores, replay, extra daily attempt or client-supplied score API exists.
- Eligible case dates are on/after each member’s UTC join date, including results earned earlier on that same date. Leaving/removal and rejoining start a new join date. Ordinary guests still play daily games normally.
- Today’s points, solved counts and ranks are null until the viewer finishes today’s official attempt, including an incorrect answer or a natural timeout. Hidden rows are alphabetical and expose only neutral participation statuses. Weekly totals, solved counts and ranks exclude today until then. On Monday this can mean zero counted days. The response displays the full Monday–Sunday range and a counted-through date.
- Equal points share a competition rank (1, 1, 3). No timing tie-breaker. Only Virriddle display names are shared; no emails, Google names, choices, evidence or solutions appear in league APIs. Public leaderboard opt-in is independent.

## Database design and access review

New migration: `supabase/migrations/20261030134138_private_friend_leagues.sql`.

It extends the existing `private.friend_groups` and `private.friend_members` tables. A private hourly-rate table is the only additional table. All three have RLS, no client table privileges and no user-facing policies: deny by default. The private schema remains unexposed. The six public RPCs are the complete league interface:

| Function | Access |
| --- | --- |
| `outbreak_leagues()` | Player’s own memberships, including browser guests |
| `outbreak_league_manage(action, group, name, member)` | Create as self; leave as member; remove/delete as owner |
| `outbreak_league_invite(group, action)` | Owner only; generate or revoke |
| `outbreak_league_preview(token)` | Anonymous/authenticated; minimal bearer-link preview |
| `outbreak_league_join(token)` | Player session; valid nonexpired token |
| `outbreak_league_standings(group, scope)` | Current members only; server spoiler gates |

All privileged functions use an empty search path and fully qualified application objects. Player identity comes from `auth.uid()` through the existing guard, never client IDs or user-editable JWT metadata. Google is no longer a league authorization condition. Guards reuse the existing authenticated player/rate-limit pattern. Creation and joining serialize per player; membership mutations and token changes lock the group row. The existing composite membership primary key prevents duplicates.

Limits: five owned leagues, twenty memberships per player, fifty members per league; five creations, twenty invitation operations and twenty redemption attempts per player/hour, plus the existing global authenticated request limit. Invalid redemption failures return structured errors so their rate counters commit. Unauthenticated preview reveals no identity, roster or standings; its protection is the unguessable token and Supabase’s API protections, not an application-level IP limit.

Member removal does not ban the account: an unexpired current invitation can be reused. The confirmation explicitly tells the owner to revoke/regenerate it if needed. Owners cannot leave without deleting the league. Ownership transfer, bans, chat and live rooms are deferred.

The standings endpoint may finalize the viewer’s already-expired official attempt through the existing timeout function. It never begins an attempt or changes a completed result. A practice/shared scorecard cannot unlock standings.

## Verification performed

`npm test` runs the existing cases, timer/scoring and PostgreSQL security tests, plus:

- `scripts/validate-leagues.mjs`: isolated PostgreSQL (PGlite), real migration/functions/roles, separate owner/member/nonmember/guest/email-only identities, guest identity checks and optional same-ID Google linking, denied direct table access, owner-only mutations, preview minimization, token hashing/rotation/expiry/revocation/deletion, duplicate joins, hourly limits, UTC join and week boundaries, tied ranks, spoof-resistant projections, hidden-result noninterference, multiple leagues, practice exclusion, timeout unlock, removal/leave and unique daily-attempt preservation.
- `scripts/validate-league-ui.mjs`: React DOM integration tests with an injected RPC fixture, base-path URLs, pending-invitation restore across a simulated OAuth redirect/reload, explicit join before/after Google, owner/member confirmations, empty/loading/error/success/expired states and copy fallback. These do not authenticate real Google accounts or call a hosted backend.
- `npm run test:connected`: sealed fixtures/answers excluded from the connected bundle.
- `VITE_BASE_PATH=/viriddle/ npm run build`: production build under the Pages base path.

No production database migration or site deployment is part of this feature branch. At implementation time, the Supabase project inventory contained only the production project, and branch inventory contained only its default main branch (migration status failed); no separate usable hosted staging database was available. The migration is applied and exercised in isolated PGlite, including fixtures for `auth.uid()` and Google identities. Live Supabase Auth, PostgREST/schema-cache behavior, Google redirects and two physical phones still need staging smoke tests. `tests/league-preview.html` and `tests/league-phone-preview.html` render explicitly disconnected UI fixtures; run the dev server with `VITE_PLAY_MODE=local` when viewing them. They are not production entrypoints.

## Release steps (not executed by the implementation)

1. Create or select an isolated staging Supabase project/branch. For an empty database apply the existing historical migrations in order, then the new league migration. For a schema matching current main apply **only** the new migration. Inspect existing reserved group names if already populated: the new name constraint requires 3–40 characters and no control characters.
2. Apply this exact new SQL through the normal migration mechanism (e.g. Supabase `apply_migration` named `private_friend_leagues`) to **staging**. Do not point migration commands at production inadvertently. Confirm the private schema is not exposed. Refresh the PostgREST schema cache if the new RPCs are not immediately discoverable.
3. Configure staging’s Google provider and redirect allowlist for the staging origin and actual path (`/` or `/viriddle/`). Build the branch using staging `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and appropriate `VITE_BASE_PATH`; both public variables must be supplied together. Do not use a service-role key. Do not change production auth settings for a staging test.
4. Run the two-account checklist below, then inspect staging security advisors. The intended privileged RPCs may be flagged as SECURITY DEFINER; verify authorization and revoked anon grants rather than granting access to private tables.
5. After review and **separate production approval**, apply only `20261030134138_private_friend_leagues.sql` to production. No fixture upload is required for leagues. Existing attempts, timers, evidence prices, daily schedule and public leaderboard opt-in remain intact. The related Darren wording edit is applied in the source presentation helper, which replaces the older stored sentence when displaying that fixture. No production practice-fixture upload is needed or was performed.
6. Merge the feature branch only when the production database is ready. The existing main-branch Pages workflow deploys the frontend on merge. The new feature checks workflow tests/builds but never deploys or applies SQL. A Sites-hosted mirror, if retained, requires its own explicit source synchronization/deployment; it is not updated by this branch.

## Two-account mobile smoke test

1. In staging, Google account A opens Friends, creates a league, generates an invitation and shares it with B. Confirm A is owner/member and the invite expiry is visible.
2. B opens the link in a fresh phone/browser tab. Before sign-in only the league name/consent appears. Sign in with Google; confirm the join screen returns and membership is not created until Join is tapped. Tap twice/reload: exactly one membership.
3. A finishes today’s official case, B has not. B sees only neutral participation, no points/solved/rank for today; weekly totals omit today. B finishes (or times out); both can compare official results. Verify ties share ranks and public leaderboard opt-in can remain off.
4. Open a practice case/shared result; verify it cannot unlock results or add points. Put the same player in another league; the same official attempt contributes there. Reopen daily after joining/reloading: no new attempt.
5. A regenerates/revokes an invite; old links fail gracefully. A removes B; B loses access. B rejoins with a current valid link, then leaves. A cannot leave as owner but can confirm deletion; deleted links fail and personal scores remain.
6. Check Today/This week around Monday 00:00 UTC and near UTC midnight, with long display names at phone widths. Sign out/switch accounts and confirm no previous account’s league data remains on screen.

## Changed files

| Area | Files |
| --- | --- |
| League backend | `supabase/migrations/20261030134138_private_friend_leagues.sql` |
| League UI and routes | `src/Friends.tsx`, `src/friends.css`, `src/leagueRoutes.ts` |
| App/auth integration | `src/connectedApp.tsx`, `src/player.tsx`, `src/bootstrap.tsx` |
| Privacy and navigation copy | `src/community.tsx` |
| Requested Darren copy edit and regression | `src/darrenStory.ts`, `scripts/validate-cases.ts` |
| Backend and React tests | `scripts/validate-leagues.mjs`, `scripts/validate-league-ui.mjs` |
| Disconnected browser fixtures | `tests/league-preview.html`, `tests/league-preview.tsx`, `tests/league-phone-preview.html` |
| CI, dependencies and checks | `.github/workflows/checks.yml`, `package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore` |
| Handoff | `README.md`, `docs/PRIVATE_LEAGUES.md` |

