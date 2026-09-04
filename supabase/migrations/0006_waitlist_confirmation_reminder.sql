-- Schedule exactly one reminder for an address that has not completed
-- double opt-in. Resend owns the timer; the application stores the scheduled
-- message id so it can cancel the reminder immediately after confirmation.
-- No service-role key and no public table read permission are introduced.

alter table public.waitlist_signups
  add column if not exists confirmation_reminder_email_id text,
  add column if not exists confirmation_reminder_scheduled_at timestamptz,
  add column if not exists confirmation_reminder_cancelled_at timestamptz;

alter table public.waitlist_signups
  drop constraint if exists waitlist_signups_reminder_email_id_length;
alter table public.waitlist_signups
  add constraint waitlist_signups_reminder_email_id_length check (
    confirmation_reminder_email_id is null
    or char_length(confirmation_reminder_email_id) between 1 and 200
  );

-- Starts a new confirmation attempt and returns at most the id of the previous
-- scheduled reminder. That lets the server cancel a stale reminder when a new
-- token replaces the old one. The email address is never returned.
create or replace function public.waitlist_request_confirmation_with_reminder(
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
returns table (
  result text,
  previous_reminder_email_id text
)
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_row public.waitlist_signups%rowtype;
  v_previous_reminder_id text;
begin
  select * into v_row
  from public.waitlist_signups
  where lower(email) = lower(p_email)
  for update;

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
    return query select 'send'::text, null::text;
    return;
  end if;

  if v_row.confirmed_at is not null then
    return query
      select
        'already_confirmed'::text,
        case
          when v_row.confirmation_reminder_cancelled_at is null
            then v_row.confirmation_reminder_email_id
          else null::text
        end;
    return;
  end if;

  if v_row.confirmation_delivered_at is not null
     and v_row.confirmation_delivered_at > now() - interval '5 minutes' then
    return query select 'throttled'::text, null::text;
    return;
  end if;

  if v_row.confirmation_reminder_cancelled_at is null then
    v_previous_reminder_id := v_row.confirmation_reminder_email_id;
  end if;

  update public.waitlist_signups
  set confirmation_token_hash = p_confirmation_token_hash,
      confirmation_sent_at = now(),
      confirmation_delivered_at = null,
      unsubscribe_token_hash = coalesce(unsubscribe_token_hash, p_unsubscribe_token_hash),
      first_name = coalesce(p_first_name, first_name),
      marketing_consent = coalesce(p_marketing_consent, marketing_consent),
      confirmation_reminder_email_id = null,
      confirmation_reminder_scheduled_at = null,
      confirmation_reminder_cancelled_at = null
  where id = v_row.id;

  return query select 'send'::text, v_previous_reminder_id;
end;
$$;

-- Called after the first confirmation message has been accepted by Resend.
-- A null reminder id is valid: confirmation still works if reminder scheduling
-- was temporarily unavailable.
create or replace function public.waitlist_mark_confirmation_delivery(
  p_token_hash text,
  p_reminder_email_id text,
  p_reminder_scheduled_at timestamptz
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

  if (p_reminder_email_id is null) <> (p_reminder_scheduled_at is null)
     or (p_reminder_email_id is not null
         and char_length(p_reminder_email_id) not between 1 and 200) then
    return 'invalid';
  end if;

  update public.waitlist_signups
  set confirmation_delivered_at = now(),
      confirmation_reminder_email_id = p_reminder_email_id,
      confirmation_reminder_scheduled_at = p_reminder_scheduled_at,
      confirmation_reminder_cancelled_at = null
  where confirmation_token_hash = p_token_hash
    and confirmed_at is null;

  if found then return 'recorded'; end if;
  return 'invalid';
end;
$$;

-- Version 2 additionally returns the scheduled reminder id for cancellation.
create or replace function public.waitlist_confirm_with_receipt_v2(
  p_token_hash text
)
returns table (
  result text,
  recipient_email text,
  should_send_receipt boolean,
  reminder_email_id text
)
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_row public.waitlist_signups%rowtype;
begin
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    return query select 'invalid'::text, null::text, false, null::text;
    return;
  end if;

  select * into v_row
  from public.waitlist_signups
  where confirmation_token_hash = p_token_hash
  for update;

  if not found then
    return query select 'invalid'::text, null::text, false, null::text;
    return;
  end if;

  if v_row.confirmed_at is not null then
    return query
      select
        'already'::text,
        case
          when v_row.confirmation_receipt_delivered_at is null
            then v_row.email
          else null::text
        end,
        v_row.confirmation_receipt_delivered_at is null,
        case
          when v_row.confirmation_reminder_cancelled_at is null
            then v_row.confirmation_reminder_email_id
          else null::text
        end;
    return;
  end if;

  if v_row.confirmation_sent_at is null
     or v_row.confirmation_sent_at < now() - interval '7 days' then
    return query select 'expired'::text, null::text, false, null::text;
    return;
  end if;

  update public.waitlist_signups
  set confirmed_at = now(),
      status = 'pending'
  where id = v_row.id;

  return query
    select
      'confirmed'::text,
      v_row.email,
      true,
      case
        when v_row.confirmation_reminder_cancelled_at is null
          then v_row.confirmation_reminder_email_id
        else null::text
      end;
end;
$$;

create or replace function public.waitlist_mark_reminder_cancelled(
  p_token_hash text,
  p_reminder_email_id text
)
returns text
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$'
     or p_reminder_email_id is null
     or char_length(p_reminder_email_id) not between 1 and 200 then
    return 'invalid';
  end if;

  update public.waitlist_signups
  set confirmation_reminder_cancelled_at = now()
  where confirmation_token_hash = p_token_hash
    and confirmation_reminder_email_id = p_reminder_email_id
    and confirmed_at is not null
    and confirmation_reminder_cancelled_at is null;

  if found then return 'recorded'; end if;

  if exists (
    select 1
    from public.waitlist_signups
    where confirmation_token_hash = p_token_hash
      and confirmation_reminder_email_id = p_reminder_email_id
      and confirmation_reminder_cancelled_at is not null
  ) then
    return 'already';
  end if;

  return 'invalid';
end;
$$;

revoke all on function public.waitlist_request_confirmation_with_reminder(
  text, text, text, text, text, text, text, text, text, boolean, text, text
) from public;
grant execute on function public.waitlist_request_confirmation_with_reminder(
  text, text, text, text, text, text, text, text, text, boolean, text, text
) to anon;

revoke all on function public.waitlist_mark_confirmation_delivery(
  text, text, timestamptz
) from public;
grant execute on function public.waitlist_mark_confirmation_delivery(
  text, text, timestamptz
) to anon;

revoke all on function public.waitlist_confirm_with_receipt_v2(text) from public;
grant execute on function public.waitlist_confirm_with_receipt_v2(text) to anon;

revoke all on function public.waitlist_mark_reminder_cancelled(text, text) from public;
grant execute on function public.waitlist_mark_reminder_cancelled(text, text) to anon;
