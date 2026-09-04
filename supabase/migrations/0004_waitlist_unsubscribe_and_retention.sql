-- Getting off the list, and not keeping what nobody confirmed.
--
-- Two obligations this table did not yet meet:
--
--   1. Someone must be able to remove themselves without writing us a mail.
--      That matters most for the case this list is most exposed to: an address
--      entered by somebody else. Waiting 30 days for the cleanup below is not
--      an answer to "that is my address and I did not put it there".
--
--   2. An address that was never confirmed is not consent to store it. It gets
--      deleted rather than kept in case it becomes useful.

-- ---------------------------------------------------------------------------
-- Unsubscribing
-- ---------------------------------------------------------------------------
--
-- Deletes rather than flags. There is nothing to keep: the row exists only to
-- send one invitation, and a suppression list of people who asked to be
-- forgotten would be its own privacy problem.

create or replace function public.waitlist_unsubscribe(p_token_hash text)
returns text
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    return 'invalid';
  end if;

  delete from public.waitlist_signups
  where unsubscribe_token_hash = p_token_hash;

  if not found then
    -- Either the token is nonsense or the row is already gone. From where the
    -- person stands those are the same state -- they are not on the list --
    -- so the page says exactly that and never "your link is broken".
    return 'not_listed';
  end if;

  return 'removed';
end;
$$;

revoke all on function public.waitlist_unsubscribe(text) from public;
grant execute on function public.waitlist_unsubscribe(text) to anon;

-- ---------------------------------------------------------------------------
-- Retention
-- ---------------------------------------------------------------------------

create or replace function public.waitlist_delete_stale_unconfirmed()
returns integer
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_deleted integer;
begin
  -- Only 'unconfirmed'. Rows created before double opt-in existed carry
  -- status 'pending' with confirmed_at still null (see 0003) -- those are real
  -- signups made under the old flow and must survive this.
  delete from public.waitlist_signups
  where status = 'unconfirmed'
    and created_at < now() - interval '30 days';

  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- Never reachable from the app. Only the scheduler and a human in the SQL
-- editor run this.
revoke all on function public.waitlist_delete_stale_unconfirmed() from public;

-- Schedule it if pg_cron is available. Wrapped so the migration still succeeds
-- on a project where the extension is not enabled -- it says so instead of
-- failing halfway through.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('waitlist-delete-stale-unconfirmed')
    where exists (
      select 1 from cron.job where jobname = 'waitlist-delete-stale-unconfirmed'
    );

    perform cron.schedule(
      'waitlist-delete-stale-unconfirmed',
      '17 3 * * *',
      'select public.waitlist_delete_stale_unconfirmed();'
    );

    raise notice 'Aufraeumjob geplant: taeglich 03:17 UTC.';
  else
    raise notice
      'pg_cron ist nicht aktiviert. Unbestaetigte Zeilen werden NICHT automatisch geloescht. '
      'Aktivieren unter Database -> Extensions -> pg_cron, danach diese Migration erneut ausfuehren.';
  end if;
end;
$$;
