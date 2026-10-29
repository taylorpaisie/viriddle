-- Run once in the Supabase SQL editor after enabling pg_cron in Database > Extensions.
-- Stale attempts are also finalized immediately on resume/profile reads.
select cron.schedule('outbreak-expire-attempts','* * * * *','select private.expire_attempts();');
-- Inspect: select * from cron.job where jobname='outbreak-expire-attempts';
