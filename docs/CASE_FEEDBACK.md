# Optional daily case feedback

Completed or timed-out official daily results offer four optional reactions: Satisfying, Confusing, Too easy, Too hard. Players choose the closest fit; this is one overall reaction, not separate satisfaction and difficulty scales. The card follows the full-case-file section and precedes support/practice navigation. Viewing results sends no rating. Practice, archive replays, local play and shared result cards do not collect feedback.

Guests and permanent accounts can save and revise one response per official attempt. The selected button is restored from the server after returning. A failed load offers a retry; a failed save retains the last confirmed selection. Feedback never changes the score, timer, evidence, streak, leaderboard or case solution. The privacy page explains that ratings/timestamps are linked to an attempt and player identity and are not public.

## Database and rollout

Apply `supabase/migrations/20261101180357_case_feedback.sql` before deploying this frontend. The migration adds a new table, RLS policies, an invoker RPC and a timestamp trigger. It does not rewrite existing attempts or cases. This PR alone does not apply the production migration or deploy either hosted frontend. Deployments without the migration show a recoverable feedback-unavailable state while results remain usable. Both GitHub Pages and Sites need their usual frontend deployment to display the card.

`public.outbreak_case_feedback(p_attempt_id uuid, p_rating text default null)` reads the caller's own response when the rating is null; otherwise it saves one allowlisted reaction. The function runs as the caller. RLS checks ownership and finalized attempt status for every table operation, including direct API calls. Column grants prevent changing the attempt ID or fabricating timestamps. No client delete permission, aggregate API, public ratings, free-text comments, new analytics tracking or extra contact details are added. Deleting the associated attempt/player cascades through ratings.

## Read the results as database owner

The following query reports all finalized attempts, response counts and counts for each reaction by case. It excludes the existing internal testing identities, including their responses, so the creator's testing does not inflate the feedback. Run it in the project SQL editor as the database owner, not in a browser client.

```sql
select c.case_date, c.public_data->>'title' as title,
 count(*) as finished_attempts,
 count(f.attempt_id) as responses,
 round(100.0 * count(f.attempt_id) / nullif(count(*), 0), 1) as response_percent,
 count(*) filter(where f.rating='satisfying') as satisfying,
 count(*) filter(where f.rating='confusing') as confusing,
 count(*) filter(where f.rating='too_easy') as too_easy,
 count(*) filter(where f.rating='too_hard') as too_hard
from public.daily_attempts a
join public.daily_cases c on c.id=a.case_id
left join public.case_feedback f on f.attempt_id=a.id
where a.status in ('completed','timed_out')
 and not exists (
  select 1 from private.analytics_internal_players i where i.player_id=a.player_id
 )
group by c.id, c.case_date, c.public_data
order by c.case_date desc;
```

Responses are voluntary and do not represent everyone who played. Compare small samples cautiously, and use confusing ratings to choose cases for human review rather than automatically changing scores or solutions.

## Validation

`npm run test:feedback` runs PostgreSQL permission/RLS tests and React interaction tests. It covers guest/permanent sessions, completed/timed-out eligibility, active-attempt rejection, other-player isolation, allowlisted values, change/idempotency behavior, timestamp and ID column restrictions, deletion cascade, unchanged attempt/event records, restored selection, error/retry states, duplicate-click locking and stale-request isolation when the player or case changes. All tests use synthetic local data and make no production writes.
