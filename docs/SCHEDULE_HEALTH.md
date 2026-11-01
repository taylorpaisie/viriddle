# Owner-only daily schedule check

Check the next 14 UTC dates before the current case bank runs out. This is a read-only owner workflow, independent of frontend deployments. It creates no database objects, grants or public endpoints.

1. Run `npm run --silent cases:schedule -- sql` to print the query. Optional arguments fix the start and window, for example `npm run --silent cases:schedule -- sql 2026-11-01 30`.
2. Run that query in the intended project's SQL editor as the database owner. Check the project before running. Copy the single `schedule_health` JSON value into a local `schedule.private.json` file (not the editor's surrounding row/export wrapper).
3. Run `npm run --silent cases:schedule -- check schedule.private.json`.

Alternatively, run the generated SQL using an existing owner-authenticated psql connection with `-X -t -A` and pipe its JSON output into `node scripts/schedule-health.mjs check -`. Keep credentials out of command arguments, public CI, and frontend environment variables.

Exit codes: **0** means the whole requested window is ready; **1** means gaps or incomplete dates; **2** means invalid input. Consecutive coverage counts from the start date, including that date, and stops at the first issue. A later scheduled date does not hide an earlier gap. Coverage is bounded by the requested window, not a claim about the entire database. Refresh the query after UTC midnight or after scheduling changes.

The report returns only dates and readiness flags. A date is ready when its case exists, its publication timestamp is no later than that day's midnight UTC, all six sealed report categories contain nonempty objects, and its sealed solution is a nonempty object. This is a presence check, not a puzzle-quality or full payload validation; use the private-pack validator and human playtesting for those. Existing published samples and fresh private puzzles both count as scheduled content.

Run as the database owner: player roles cannot read the private schema and must not be granted access for this check. Never install this query as a public RPC or import the tooling into the app. No live schedule has been verified merely by adding this tool.

`npm run test:schedule` runs synthetic PostgreSQL checks locally, including output privacy and player-role denial. Production credentials are unnecessary.
