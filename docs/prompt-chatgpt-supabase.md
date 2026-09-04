# Prompt für ChatGPT (Supabase MCP)

Erledigt **Goal 1**: Projekt anlegen, die zwei Migrationen einspielen, URL und Key
zurückgeben.

## Vorher — das musst du selbst tun

1. Bei <https://supabase.com> registrieren und eine Organisation anlegen
   (Plan **Free**). Ein Agent kann keine Registrierung mit E-Mail-Bestätigung
   und AGB-Zustimmung durchlaufen.
2. Den **Supabase MCP Server** in ChatGPT verbinden und im Browser autorisieren.
3. Dabei **nicht** `read_only=true` setzen — sonst schlagen die Migrationen fehl.
4. Den Server **nicht** an ein `project_ref` binden — im projektgebundenen Modus
   ist `create_project` deaktiviert.

## Danach — das machst du wieder selbst

Die zwei Werte in Vercel eintragen (der MCP-Server kann Vercel nicht):

```bash
npx vercel env add SUPABASE_URL production
npx vercel env add SUPABASE_ANON_KEY production
```

---

# ▼ Ab hier alles kopieren und in ChatGPT einfügen ▼

Du hast Zugriff auf den Supabase MCP Server. Führe die folgenden Schritte der
Reihe nach aus und halte an, sobald einer fehlschlägt — rate nicht und baue
nichts um.

## Schritt 1 — Projekt anlegen

Lege mit `create_project` ein neues Supabase-Projekt an:

- Name: `evi-waitlist`
- Region: **eu-central-1** (Frankfurt). Das ist verbindlich: In der Tabelle
  liegen personenbezogene Daten deutscher Studierender.
- Plan: Free

Warte, bis das Projekt den Status `ACTIVE_HEALTHY` hat. Nenne mir die
Projekt-Referenz.

## Schritt 2 — Migration 0001

Wende mit `apply_migration` folgende Migration an, Name
`0001_create_waitlist_signups`.

Ändere **nichts** daran. Insbesondere: ergänze **keine** SELECT-Policy. Dass die
Warteliste mit dem öffentlichen Key nicht lesbar ist, ist beabsichtigt und die
zentrale Sicherheitseigenschaft dieses Aufbaus.

```sql
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
```

## Schritt 3 — Migration 0002

Wende mit `apply_migration` folgende Migration an, Name `0002_waitlist_status`.

Hinweise der Art *„constraint … does not exist, skipping"* sind normal — die
Migration ist absichtlich wiederholbar.

```sql
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
```

## Schritt 4 — Nachweisen, dass es stimmt

Führe mit `execute_sql` aus und zeige mir das Ergebnis:

```sql
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'waitlist_signups'
order by ordinal_position;

select policyname, cmd, roles, with_check
from pg_policies
where schemaname = 'public' and tablename = 'waitlist_signups';

select indexname from pg_indexes where tablename = 'waitlist_signups';
```

Prüfe und sage mir ausdrücklich, ob **alle** vier Punkte zutreffen:

1. Die Spalten `email`, `first_name`, `created_at`, `marketing_consent`,
   `status`, `confirmed_at`, `invited_at` existieren.
2. `status` hat den Default `'pending'`.
3. Es gibt **genau eine** Policy, und zwar für `INSERT`. Gibt es eine
   SELECT-Policy, ist etwas falsch gelaufen — sag es mir, statt es zu beheben.
4. Der Index `waitlist_signups_status_created_at_idx` existiert.

## Schritt 5 — Die zwei Werte

Gib mir aus:

- die Projekt-URL (`get_project_url`)
- den öffentlichen Key (`get_publishable_keys`) — den **publishable** bzw.
  **anon**-Key

Gib mir **niemals** den `service_role`- oder `sb_secret_`-Key aus. Diese Keys
umgehen Row-Level-Security und würden die komplette Warteliste lesbar machen.
Die Anwendung braucht sie nicht.

## Wichtig

Spiel **keine weiteren Migrationen** ein und lege **keine** Tabellen, Policies
oder Spalten zusätzlich an. Es existieren noch die Migrationen 0003 und 0004,
aber die dürfen erst später zusammen mit den Mail-Zugangsdaten eingespielt
werden — ab 0003 lehnt das Anmeldeformular jede Anmeldung ab, solange der
Mailversand nicht konfiguriert ist.

Ergänze der Tabelle niemals Spalten für Diagnosen, Symptome, Medikamente,
Therapie oder Freitext.

# ▲ Bis hier kopieren ▲
