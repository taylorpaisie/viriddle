# Public leaderboard

Apply `supabase/migrations/202611020001_weekly_leaderboard.sql` before deploying this frontend. This replaces the existing RPC without changing its signature or public participation rules. No production migration is applied by this change.

The default screen is This week: Monday 00:00 UTC through Sunday, using official case dates. Today and All time remain available. Future-dated cases and active attempts are excluded. Completed incorrect and timed-out attempts count as cases with their recorded zero points. Practice never counts. Equal point totals share a competition rank (1, 1, 3); elapsed time and submission time do not break ties. Alphabetical display-name and internal ID ordering keep pagination stable between tied players, without publishing IDs.

Only opted-in permanent accounts appear. Guests may view the board. A separate personal-standing card shows the caller’s rank even beyond the first 25 entries. No evidence, answers, emails or Google names are returned.

Validation: `npm run test:backend` covers weekly exclusions, timezone independence, tied ranks across pages, privacy and the caller’s rank outside the top 25. `npm run typecheck` and `npm run build` validate the frontend.
