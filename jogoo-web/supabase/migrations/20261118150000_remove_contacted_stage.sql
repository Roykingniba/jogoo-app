-- The client journey no longer has a "contacted" step:
-- signed_up → site_visit → quote_sent → payment_made → installation_scheduled → installed.
-- Steps already recorded as "contacted" are removed with it.

delete from public.journey_events where stage = 'contacted';

alter type public.journey_stage rename to journey_stage_old;
create type public.journey_stage as enum (
  'signed_up', 'site_visit', 'quote_sent', 'payment_made', 'installation_scheduled', 'installed'
);
alter table public.journey_events
  alter column stage type public.journey_stage using stage::text::public.journey_stage;
drop type public.journey_stage_old;
