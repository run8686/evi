-- Evi Early Access waitlist.
--
-- Deliberately minimal: an e-mail address, an optional first name, when they
-- signed up and where they came from. Nothing about how anybody feels.
--
-- This table must never gain columns for diagnoses, symptoms, medication,
-- therapy history, mental-health conditions or free text. That data does not
-- belong in a marketing waitlist.

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text,
  created_at timestamptz not null default now(),

  -- Landing page locale, e.g. 'de-DE'
  locale text,

  -- Channel attribution, so we can compare conversion by source
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,

  -- Separate, never pre-selected, optional consent for marketing mail.
  -- Operational Early-Access mail does not depend on this flag.
  marketing_consent boolean not null default false,

  constraint waitlist_signups_email_length check (char_length(email) between 3 and 254),
  constraint waitlist_signups_email_shape check (position('@' in email) > 1),
  constraint waitlist_signups_first_name_length check (
    first_name is null or char_length(first_name) between 1 and 80
  )
);

-- Case-insensitive de-duplication: signing up twice is not an error.
create unique index if not exists waitlist_signups_email_unique
  on public.waitlist_signups (lower(email));

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);

alter table public.waitlist_signups enable row level security;

-- The public key may only ever append a row.
--
-- There is intentionally NO select, update or delete policy: with RLS enabled,
-- anything without a policy is denied. So even if the key leaked, it could not
-- be used to read the mailing list back out. Reading happens in the Supabase
-- dashboard or with the service-role key, which this app never uses.
drop policy if exists "waitlist_signups_insert_anon" on public.waitlist_signups;
create policy "waitlist_signups_insert_anon"
  on public.waitlist_signups
  for insert
  to anon
  with check (true);
