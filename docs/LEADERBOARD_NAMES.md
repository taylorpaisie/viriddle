Public leaderboard participation requires a chosen display name and explicit opt-in. Connected guests are eligible without Google. Play, scoring, history and private leagues remain available without public participation. The results page offers a name form and “Maybe later”; the profile page remains available for subsequent changes.

Names use 3–20 ASCII letters, numbers, spaces, underscores or hyphens, with at least one letter or number. Names are trimmed and unique without regard to case. Generated Investigator names, administrative names and a basic list of profanity are rejected in both the client and profile RPC. This is a basic filter rather than comprehensive moderation.

The SQL preserves eligible existing custom names and their opt-ins. Generated or invalid legacy names are removed from the public board without changing attempts, scores, history or league memberships.

Rollout: the SQL source is [leaderboard-names.sql](../supabase/leaderboard-names.sql). Generate its migration using `supabase migration new leaderboard_names` and put this source in that generated file. Apply the migration before deploying the frontend. The current development host denied execution of the Supabase CLI, so the source has not been registered in migration history or applied to production.

The database regression test runs against an empty, disposable PostgreSQL database:

```sh
psql -v ON_ERROR_STOP=1 -f tests/leaderboard-names.sql
```

It verifies legacy names, validation, case-insensitive duplicates, generated-name rejection, guest eligibility, opt-out, score retention and RPC permissions. Do not run this bootstrap test against an existing project database.
