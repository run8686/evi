-- Double opt-in for the Early Access waitlist.
--
-- Until now a submitted form was a signup. From here a signup is only real once
-- the person clicked the confirmation button in a mail sent to that address.
-- That is what makes the consent provable and what keeps someone from putting a
-- stranger's address on a mental-health waiting list.
--
-- The hard constraint this migration works around: the landing page holds only
-- the anon key, and the whole design rests on that key being unable to read the
-- list back out (see 0001). But confirming a token requires a lookup and an
-- update. Rather than granting SELECT or introducing a service-role key, both
-- operations live in `security definer` functions that return a single status
-- word and never a row. After this migration the anon key has no direct table
-- access at all -- not even INSERT.

-- ---------------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------------

-- Two timestamps, not one, and the difference matters.
--
--   confirmation_sent_at       when the token was issued  -> drives expiry
--   confirmation_delivered_at  when the mail provider accepted it -> drives the
--                              resend throttle
--
-- If they were one column, a failed send would still start the throttle: the
-- person retries, the database answers 'throttled', and the page shows the
-- success screen for a mail that never went out. Keeping them apart means a
-- failed send can be retried immediately and never produces a false success.
alter table public.waitlist_signups
  add column if not exists confirmation_token_hash text,
  add column if not exists confirmation_sent_at timestamptz,
  add column if not exists confirmation_delivered_at timestamptz,
  add column if not exists unsubscribe_token_hash text;

-- Only the SHA-256 hash of a token is stored. Whoever reads this table cannot
-- produce a working confirmation link from it.
alter table public.waitlist_signups
  drop constraint if exists waitlist_signups_confirmation_token_hash_shape;
alter table public.waitlist_signups
  add constraint waitlist_signups_confirmation_token_hash_shape check (
    confirmation_token_hash is null
    or confirmation_token_hash ~ '^[0-9a-f]{64}$'
  );

alter table public.waitlist_signups
  drop constraint if exists waitlist_signups_unsubscribe_token_hash_shape;
alter table public.waitlist_signups
  add constraint waitlist_signups_unsubscribe_token_hash_shape check (
    unsubscribe_token_hash is null
    or unsubscribe_token_hash ~ '^[0-9a-f]{64}$'
  );

create unique index if not exists waitlist_signups_confirmation_token_hash_idx
  on public.waitlist_signups (confirmation_token_hash)
  where confirmation_token_hash is not null;

create unique index if not exists waitlist_signups_unsubscribe_token_hash_idx
  on public.waitlist_signups (unsubscribe_token_hash)
  where unsubscribe_token_hash is not null;

-- New signups now start unconfirmed. Migration 0002 deliberately defaulted to
-- 'pending' because no confirmation step existed yet; that step exists now.
--
-- Rows created before this migration keep status 'pending' and stay usable.
-- They are real signups made under the old flow, not unconfirmed ones -- see
-- docs/waitlist-go-live-plan.md, Goal 3, for the one-time confirmation mail.
alter table public.waitlist_signups
  alter column status set default 'unconfirmed';

-- ---------------------------------------------------------------------------
-- The anon key loses its direct write path
-- ---------------------------------------------------------------------------
--
-- Everything now goes through the two functions below. A form submission that
-- cannot reach them fails loudly rather than writing a half-finished row.
drop policy if exists "waitlist_signups_insert_anon" on public.waitlist_signups;
revoke all on public.waitlist_signups from anon;

-- ---------------------------------------------------------------------------
-- Signing up
-- ---------------------------------------------------------------------------

create or replace function public.waitlist_request_confirmation(
  p_email text,
  p_first_name text,
  p_locale text,
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text,
  p_utm_content text,
  p_utm_term text,
  p_referrer text,
  p_marketing_consent boolean,
  p_confirmation_token_hash text,
  p_unsubscribe_token_hash text
)
returns text
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_row public.waitlist_signups%rowtype;
begin
  select * into v_row
  from public.waitlist_signups
  where lower(email) = lower(p_email);

  if not found then
    insert into public.waitlist_signups (
      email, first_name, locale,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer,
      marketing_consent, status,
      confirmation_token_hash, confirmation_sent_at, unsubscribe_token_hash
    ) values (
      lower(p_email), p_first_name, p_locale,
      p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, p_utm_term, p_referrer,
      coalesce(p_marketing_consent, false), 'unconfirmed',
      p_confirmation_token_hash, now(), p_unsubscribe_token_hash
    );
    return 'send';
  end if;

  -- Already on the list for good. Sending another confirmation would be noise,
  -- and the caller must not learn that this address is registered.
  if v_row.confirmed_at is not null then
    return 'already_confirmed';
  end if;

  -- Someone hammering the form must not be able to use it to mail-bomb an
  -- address they do not own. Throttling on *delivered*, not on issued: if the
  -- last send failed, the person must be able to try again at once.
  if v_row.confirmation_delivered_at is not null
     and v_row.confirmation_delivered_at > now() - interval '5 minutes' then
    return 'throttled';
  end if;

  -- Still unconfirmed: replace the token and send again. The old link dies here.
  update public.waitlist_signups
  set confirmation_token_hash = p_confirmation_token_hash,
      confirmation_sent_at = now(),
      unsubscribe_token_hash = coalesce(unsubscribe_token_hash, p_unsubscribe_token_hash),
      first_name = coalesce(p_first_name, first_name),
      marketing_consent = coalesce(p_marketing_consent, marketing_consent)
  where id = v_row.id;

  return 'send';
end;
$$;

-- ---------------------------------------------------------------------------
-- Recording that the mail actually went out
-- ---------------------------------------------------------------------------
--
-- Called only after the mail provider accepted the message. Until then the row
-- carries a token but no delivery, and a retry is allowed immediately.

create or replace function public.waitlist_mark_confirmation_delivered(
  p_token_hash text
)
returns text
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    return 'invalid';
  end if;

  update public.waitlist_signups
  set confirmation_delivered_at = now()
  where confirmation_token_hash = p_token_hash
    and confirmed_at is null;

  if not found then
    return 'invalid';
  end if;

  return 'recorded';
end;
$$;

-- ---------------------------------------------------------------------------
-- Confirming
-- ---------------------------------------------------------------------------

create or replace function public.waitlist_confirm(p_token_hash text)
returns text
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_row public.waitlist_signups%rowtype;
begin
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    return 'invalid';
  end if;

  select * into v_row
  from public.waitlist_signups
  where confirmation_token_hash = p_token_hash;

  if not found then
    return 'invalid';
  end if;

  -- The token is deliberately NOT cleared on confirmation. People click the
  -- button twice, reload the page, or open the mail again on another device.
  -- Clearing it would turn every one of those into "invalid link", which reads
  -- as "something went wrong" to someone who did everything right. A token on a
  -- confirmed row can do nothing except produce this answer.
  if v_row.confirmed_at is not null then
    return 'already';
  end if;

  if v_row.confirmation_sent_at is null
     or v_row.confirmation_sent_at < now() - interval '7 days' then
    return 'expired';
  end if;

  update public.waitlist_signups
  set confirmed_at = now(),
      status = 'pending'
  where id = v_row.id;

  return 'confirmed';
end;
$$;

-- ---------------------------------------------------------------------------
-- Who may call them
-- ---------------------------------------------------------------------------
--
-- `security definer` functions are granted to PUBLIC by default, which would
-- include every future role. Revoke first, then grant deliberately.

revoke all on function public.waitlist_request_confirmation(
  text, text, text, text, text, text, text, text, text, boolean, text, text
) from public;
grant execute on function public.waitlist_request_confirmation(
  text, text, text, text, text, text, text, text, text, boolean, text, text
) to anon;

revoke all on function public.waitlist_confirm(text) from public;
grant execute on function public.waitlist_confirm(text) to anon;

revoke all on function public.waitlist_mark_confirmation_delivered(text) from public;
grant execute on function public.waitlist_mark_confirmation_delivered(text) to anon;
