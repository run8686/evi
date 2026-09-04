-- Send the final "Du bist auf der Liste" receipt only after double opt-in.
--
-- The application has no service-role key and the anon key has no table read
-- access. This narrow security-definer function therefore returns the address
-- only when a valid, high-entropy confirmation token identifies the row and a
-- receipt still needs to be sent. It never exposes the list or accepts an
-- address from the caller.

alter table public.waitlist_signups
  add column if not exists confirmation_receipt_delivered_at timestamptz;

create or replace function public.waitlist_confirm_with_receipt(
  p_token_hash text
)
returns table (
  result text,
  recipient_email text,
  should_send_receipt boolean
)
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_row public.waitlist_signups%rowtype;
begin
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    return query select 'invalid'::text, null::text, false;
    return;
  end if;

  select * into v_row
  from public.waitlist_signups
  where confirmation_token_hash = p_token_hash
  for update;

  if not found then
    return query select 'invalid'::text, null::text, false;
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
        v_row.confirmation_receipt_delivered_at is null;
    return;
  end if;

  if v_row.confirmation_sent_at is null
     or v_row.confirmation_sent_at < now() - interval '7 days' then
    return query select 'expired'::text, null::text, false;
    return;
  end if;

  update public.waitlist_signups
  set confirmed_at = now(),
      status = 'pending'
  where id = v_row.id;

  return query select 'confirmed'::text, v_row.email, true;
end;
$$;

create or replace function public.waitlist_mark_receipt_delivered(
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
  set confirmation_receipt_delivered_at = now()
  where confirmation_token_hash = p_token_hash
    and confirmed_at is not null
    and confirmation_receipt_delivered_at is null;

  if found then
    return 'recorded';
  end if;

  if exists (
    select 1
    from public.waitlist_signups
    where confirmation_token_hash = p_token_hash
      and confirmation_receipt_delivered_at is not null
  ) then
    return 'already';
  end if;

  return 'invalid';
end;
$$;

revoke all on function public.waitlist_confirm_with_receipt(text) from public;
grant execute on function public.waitlist_confirm_with_receipt(text) to anon;

revoke all on function public.waitlist_mark_receipt_delivered(text) from public;
grant execute on function public.waitlist_mark_receipt_delivered(text) to anon;
