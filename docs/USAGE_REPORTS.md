# Creator and testing usage

The private `analytics_internal_players` table identifies internal player IDs. The creator's verified Google-linked player identity is configured separately in the live database, not embedded in the frontend or migration. The marker is for reporting only: it grants no permissions and does not change attempts, scores, rankings, leagues, limits or guest access.

In the Supabase SQL Editor, run:

```sql
select * from private.usage_summary;
select * from private.usage_daily order by day_utc desc;
```

`other_*` columns exclude marked internal identities retroactively and on future reads. `excluded_*` columns show the internal activity separately. `only_internal_daily_attempts` means at least one official attempt exists and every recorded official attempt belongs to an excluded identity; it makes no claim about page visitors or practice usage. Daily reports use the UTC day an attempt started, matching the game reset. Submitted totals exclude timeouts; active status is stored status and may include attempts not yet expired by the server.

These are database-owner reports in the private schema, not a public dashboard or a client RPC. RLS and explicit privilege revocations prevent anonymous or authenticated clients from reading reports or marking themselves/others as internal. Views use security_invoker; no new privileged API function is introduced.

## Recognizing the creator

Sign into the same Google account on each phone/browser. The stable Supabase player ID is recognized regardless of device, theme, IP or network. This excludes that identity's existing and future activity. Guest browser identities, separate accounts, incognito profiles, cleared browser storage and old pre-link identities cannot safely be inferred to be the creator. Historical unmarked guests may include testing. Do not identify someone by their display name, IP, user-editable metadata, or by assuming every current guest is the creator.

To mark another **verified** testing identity, the database owner can insert its known player ID into `private.analytics_internal_players`; to undo an exclusion, delete that marker. Do not grant client write access. The creator's email and production ID are deliberately absent from this repository.

Reports count player identities and official daily attempts, not unique humans, page views or practice plays. They cannot reconstruct historical visits that were never logged. No analytics SDK, visitor fingerprint, new collection of personal information, or account creation is added.

Security verification: clients have no `USAGE` on the private schema and no SELECT/INSERT privileges on these objects. The exclusion table intentionally has RLS enabled with no client policies; Supabase reports this as an informational [RLS enabled / no policy advisory](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy). This is the desired deny-by-default posture, not a missing public-access policy.
