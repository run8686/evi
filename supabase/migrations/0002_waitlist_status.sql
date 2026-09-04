-- Invite tracking for the Early Access rollout.
--
-- The waitlist opens before the alpha exists, so people are let in as small
-- waves. That needs the one thing the table did not have: a record of where
-- each person stands in that process.
--
-- Deliberately four columns and no admin UI. The Supabase table editor is the
-- admin interface: filter by status, sort by created_at, take the oldest few,
-- invite them, flip the status. Reasoning in docs/waitlist-go-live-plan.md.
--
-- Still nothing about a person. This migration adds process state only. The
-- prohibition in 0001 stands: no diagnoses, no symptoms, no medication, no
-- therapy history, no free text.

alter table public.waitlist_signups
  add column if not exists status text not null default 'pending',
  add column if not exists confirmed_at timestamptz,
  add column if not exists invited_at timestamptz;

-- 'unconfirmed' is listed now although nothing writes it yet: double opt-in
-- (migration 0003) will make it the new default, and naming it here means that
-- migration does not have to rewrite this constraint under load.
--
-- Until then 'pending' is the default, because before double opt-in exists
-- every stored signup IS a real one -- defaulting to 'unconfirmed' would hide
-- live signups behind a filter that nothing could ever clear.
--
--   unconfirmed  double opt-in mail sent, not yet confirmed  (from 0003)
--   pending      on the list, waiting for an invitation
--   invited      invitation sent
--   joined       took the invitation and signed up
--   declined     asked not to be invited
alter table public.waitlist_signups
  drop constraint if exists waitlist_signups_status_check;

alter table public.waitlist_signups
  add constraint waitlist_signups_status_check
  check (status in ('unconfirmed', 'pending', 'invited', 'joined', 'declined'));

-- The one query the invite workflow runs: oldest pending signups first.
create index if not exists waitlist_signups_status_created_at_idx
  on public.waitlist_signups (status, created_at desc);

-- Flipping status to 'invited' in the table editor is a single-field edit.
-- Stamping the date by hand as well would be forgotten, and a wrong date is
-- worse than none -- it decides who has already been contacted.
create or replace function public.waitlist_stamp_invited_at()
returns trigger
language plpgsql
-- Pinned so the function cannot be redirected by a caller's search_path.
-- Supabase's database linter flags mutable search_path on any function.
set search_path = pg_catalog
as $$
begin
  if new.status = 'invited' and new.invited_at is null then
    new.invited_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists waitlist_signups_stamp_invited_at on public.waitlist_signups;
create trigger waitlist_signups_stamp_invited_at
  before insert or update on public.waitlist_signups
  for each row
  execute function public.waitlist_stamp_invited_at();

-- Tighten the public insert policy over the new columns.
--
-- The anon key may still only append, but now it may not append a row that
-- claims to be already invited or already confirmed. Those states are set by a
-- human in the dashboard, never by a form submission. The server action does
-- not send these fields at all, so the column defaults satisfy this check.
drop policy if exists "waitlist_signups_insert_anon" on public.waitlist_signups;
create policy "waitlist_signups_insert_anon"
  on public.waitlist_signups
  for insert
  to anon
  with check (
    status = 'pending'
    and confirmed_at is null
    and invited_at is null
  );
