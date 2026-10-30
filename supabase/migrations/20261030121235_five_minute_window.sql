-- New official investigations get five minutes. Existing attempts keep their
-- original duration, deadline and score, including completed and expired runs.
alter table public.daily_attempts alter column duration_seconds set default 300;
