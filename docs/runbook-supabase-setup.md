# Runbook: Supabase einrichten und Warteliste live schalten

Für **Goal 1** aus `docs/waitlist-go-live-plan.md`. Alles, was nur du machen kannst,
in der Reihenfolge, in der es gemacht werden muss. Dauer: ca. 15 Minuten.

Übergabepunkte an Claude sind mit **→ ÜBERGABE** markiert.

---

## Teil A — Supabase-Projekt anlegen

### A1. Account

1. <https://supabase.com> öffnen → **Start your project**.
2. Mit GitHub oder E-Mail anmelden.
3. Falls nach einer Organisation gefragt wird: anlegen, Plan **Free**.

### A2. Projekt

1. **New project**.
2. **Name:** `evi-waitlist`
3. **Database Password:** auf **Generate a password** klicken und den Wert
   **in deinen Passwortmanager speichern**. Er wird für diese Landingpage nicht
   gebraucht, aber ohne ihn kommst du später nicht direkt an die Datenbank.
4. **Region:** `Central EU (Frankfurt)` — wichtig, weil personenbezogene Daten
   deutscher Studierender darin liegen.
5. **Create new project**, dann ca. 2 Minuten warten, bis der Status grün ist.

---

## Teil B — Die zwei Migrationen ausführen

Reihenfolge zählt. `0002` setzt auf `0001` auf.

### B1. Migration 0001

1. Linke Seitenleiste → **SQL Editor** → **New query**.
2. Den **kompletten** Inhalt von `supabase/migrations/0001_create_waitlist_signups.sql`
   hineinkopieren.
3. **Run** (oder Cmd+Enter).
4. Erwartet: `Success. No rows returned`.

### B2. Migration 0002

1. Wieder **New query**.
2. Kompletter Inhalt von `supabase/migrations/0002_waitlist_status.sql`.
3. **Run**.
4. Erwartet: `Success. No rows returned`. Hinweise der Art
   *„constraint … does not exist, skipping"* sind normal — die Migration ist
   absichtlich wiederholbar geschrieben.

### B3. Sichtprüfung

1. Seitenleiste → **Table Editor** → Tabelle `waitlist_signups`.
2. Die Tabelle ist leer und hat unter anderem diese Spalten:
   `email`, `first_name`, `created_at`, `marketing_consent`,
   `status`, `confirmed_at`, `invited_at`.
3. Steht `status` nicht dabei, wurde B2 nicht ausgeführt.

---

## Teil C — Die zwei Werte holen

1. Seitenleiste ganz unten → **Project Settings** → **API Keys**.
2. Du brauchst genau zwei Werte:

   | Was | Wo | Sieht aus wie |
   | --- | --- | --- |
   | **Project URL** | Settings → API (oder „Data API") | `https://abcdefgh.supabase.co` |
   | **Öffentlicher Key** | Settings → API Keys | `sb_publishable_…` **oder** ein langer `eyJ…`-String mit der Beschriftung `anon` `public` |

3. Supabase stellt gerade auf neue Keys um. **Beide funktionieren.** Wenn du
   `sb_publishable_…` siehst, nimm den. Wenn du nur `anon` `public` siehst, nimm den.
   Der Publishable Key nimmt serverseitig dieselbe `anon`-Rolle an, die
   Row-Level-Security-Regeln greifen also identisch.

> **Nimm niemals** `service_role` oder `sb_secret_…`. Diese Keys umgehen
> Row-Level-Security und könnten die komplette Warteliste auslesen. Diese App
> braucht sie nicht und darf sie nicht bekommen.

---

## Teil D — Werte in Vercel setzen

Im Terminal, im Ordner `evi-landingpage`. Bei jedem Befehl den Wert einfügen
und Enter drücken.

```bash
npx vercel env add SUPABASE_URL production
npx vercel env add SUPABASE_ANON_KEY production
```

Wenn du sie auch für Preview-Deployments willst, dasselbe noch einmal mit
`preview` statt `production`.

> Diesen Weg gehst du selbst, damit die Keys nie durch einen Chatverlauf laufen.
> Wenn dir das egal ist, kannst du mir die zwei Werte auch geben — dann setze ich
> sie. Deine Entscheidung.

**→ ÜBERGABE 1:** Sag Claude *„Supabase steht, Variablen sind gesetzt."*
Claude übernimmt dann Teil E und F.

---

## Teil E — Verkabelung prüfen (Claude)

```bash
npx vercel env pull .env.local
npm run verify:waitlist
```

Erwartet:

```
  ok   Konfiguration
  ok   Migration 0001 — Tabelle und Constraints
  ok   Migration 0002 — Status geschützt
  ok   Warteliste nicht auslesbar

Alles grün. Eine echte Anmeldung würde gespeichert.
```

Das Skript schreibt nichts in die Tabelle. Ist etwas rot, sagt es welcher Schritt
oben fehlt.

---

## Teil F — Deployen und echt testen (Claude)

1. `npx vercel --prod`
2. Auf <https://evi-de.vercel.app> mit einer echten Adresse anmelden.
3. Im **Table Editor** prüfen: eine Zeile, `status = pending`.
4. Nochmal mit derselben Adresse in anderer Schreibweise anmelden → gleicher
   Erfolgsbildschirm, **keine** zweite Zeile.
5. Testzeile löschen.

Danach ist Goal 1 erledigt und die Warteliste sammelt echte Anmeldungen.

---

## Teil G — Domain, Mailversand, Livegang

Der **einzige verbleibende Blocker**. Bis das steht, bleibt die Produktion auf
dem jetzigen Stand: Die Warteliste sammelt, aber ohne Bestätigungsmail.

### Bereits erledigt (von Claude gesetzt)

| Variable | Stand |
| --- | --- |
| `SUPABASE_URL` | ✅ gesetzt |
| `SUPABASE_ANON_KEY` | ✅ gesetzt |
| `CRON_SECRET` | ✅ erzeugt und gesetzt |
| `WAITLIST_TOKEN_SECRET` | ✅ erzeugt und gesetzt |
| `RESEND_API_KEY` | ❌ braucht die Domain |
| `WAITLIST_MAIL_FROM` | ❌ braucht die Domain |

### G1. Domain

1. Domain kaufen bei INWX, Netcup oder Hetzner (5–15 €/Jahr).
2. In Vercel → Projekt `evi-de` → **Settings → Domains** hinzufügen, den
   angezeigten DNS-Einträgen folgen.
3. `NEXT_PUBLIC_SITE_URL` in Vercel auf die neue Adresse setzen.

### G2. Resend

4. Bei <https://resend.com> anmelden, **Add Domain** → als Subdomain
   `mail.<deine-domain>` (isoliert die Sende-Reputation vom Rest der Domain).
5. Die DNS-Einträge von Resend (SPF, DKIM, DMARC) beim Domain-Anbieter
   eintragen und auf „Verified" warten.
6. Auftragsverarbeitungsvertrag bei Resend abschließen.

### G3. pg_cron aktivieren

7. In Supabase unter *Database → Extensions* **pg_cron** aktivieren. Ohne die
   Extension werden unbestätigte Anmeldungen nicht automatisch nach 30 Tagen
   gelöscht; Migration 0004 sagt das beim Ausführen auch ausdrücklich.

**→ ÜBERGABE 2:** Sag Claude *„Domain steht, Resend ist verifiziert"* und gib den
Domainnamen durch.

---

## Teil H — Livegang (Claude)

**Die Reihenfolge ist nicht beliebig.** Ab Migration 0003 lehnt das Formular jede
Anmeldung ab, solange der Mailversand fehlt — und ab dem neuen Deploy ruft die
Anwendung Funktionen auf, die es ohne 0003 nicht gibt. Beides muss zusammen
passieren, sonst steht die Warteliste still.

1. `RESEND_API_KEY` und `WAITLIST_MAIL_FROM` in Vercel setzen.
2. `supabase/migrations/0003_waitlist_double_opt_in.sql` im SQL-Editor ausführen.
3. `supabase/migrations/0004_waitlist_unsubscribe_and_retention.sql` ausführen.
4. `npm run verify:waitlist` — muss Migration 0003 und 0004 erkennen und grün sein.
5. `npx vercel --prod` — deployt den Arbeitsstand samt Bestätigungsseite,
   Abmeldeseite und Keep-Alive-Cron.
6. Echter Test: Anmeldung mit einer erreichbaren Adresse, Mail abwarten,
   Bestätigen-Button klicken, Zeile im Table-Editor prüfen (`status = pending`,
   `confirmed_at` gesetzt), danach über den Abmeldelink wieder löschen.
7. Den Zeilen aus der Phase davor einmalig eine Bestätigungsmail nachreichen.

---

## Was du dabei NICHT tun sollst

- Keinen `service_role`- oder `sb_secret_`-Key in Vercel eintragen.
- Keine SELECT-Policy auf `waitlist_signups` anlegen, auch nicht „nur zum Testen".
  Dass die Liste mit dem öffentlichen Key nicht lesbar ist, ist die zentrale
  Eigenschaft des Aufbaus.
- Keine Spalten für Diagnosen, Symptome, Medikamente, Therapie oder Freitext
  ergänzen.
- **Den Arbeitsstand nicht deployen, bevor Schritt H1–H3 erledigt sind.** Die
  umgebaute Server Action verlangt Resend und die RPCs aus 0003; ohne beides
  lehnt sie jede Anmeldung ab.
