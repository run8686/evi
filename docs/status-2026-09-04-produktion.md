# Produktionsstatus Warteliste — 2026-09-04

Verifikation der Übergabe aus ChatGPT Work. Nichts davon ist übernommen, alles
nachgeprüft.

## Live und bestätigt

| Prüfung | Ergebnis |
| --- | --- |
| `evi-health.eu` → `www` | 308-Weiterleitung, Ziel liefert 200 |
| Canonical / og:url | `https://www.evi-health.eu` |
| `/warteliste/bestaetigen` | 200 |
| `/warteliste/abmelden` | 200 |
| `/api/keep-alive` | 401 ohne Authentifizierung — korrekt |
| `/assets/evi-logo-email.png` | 200 |
| Deployment | `evi-mst9ltqg2`, aliased auf beide Domains |
| Quellstand vs. Deployment | keine Datei neuer als der Deploy |
| `typecheck` / `lint` / `build` | grün |

**Der Deploy aus ChatGPT Work war also erfolgreich**, entgegen der Annahme in der
Übergabe. Ich habe zusätzlich neu deployt, weil ich `WAITLIST_MAIL_FROM` geändert
habe (siehe unten).

## Datenbank

Migrationen 0003–0006 sind produktiv aktiv. Der Preflight erreicht alle RPCs:
Bestätigung, Abmeldung, Aufnahmebestätigung, Erinnerung und Erinnerungs-Storno.
Direkter Tabellenzugriff durch `anon` ist gesperrt, Lesen wird mit `42501`
abgewiesen.

## Echter Produktionstest

Mit `delivered@resend.dev` (Resends Test-Empfänger) über die Live-Seite:

1. Anmeldung → **„Schau in dein Postfach."**
   Dieser Bildschirm erscheint nur, wenn Resend die Mail angenommen hat — bei
   einem Fehlschlag liefert `actions.ts` „Wir konnten dir gerade keine
   Bestätigungsmail schicken".
2. Abmeldung über den abgeleiteten Abmeldelink → **„Erledigt. Deine Adresse ist
   gelöscht."** (`status=removed`)
3. Testzeile ist entfernt.

## Korrigiert

**`WAITLIST_MAIL_FROM` war `hello@evi-health.eu`** — nur die nackte Adresse. Die
Übergabe verlangt `Evi <hello@evi-health.eu>`; ohne Anzeigename sehen Empfänger
die Adresse statt „Evi". Korrigiert und neu deployt.

**Preflight meldete den Resend-Key fälschlich als gesetzt.** `vercel env pull`
schreibt für Secret-Variablen den Literaltext `[SENSITIVE]`, und die Prüfung war
eine reine Truthiness-Abfrage. Das Skript unterscheidet jetzt zwischen „fehlt",
„lokal nicht prüfbar" und „vorhanden" und meldet den mittleren Fall nicht mehr
grün.

## Offen — von hier aus nicht prüfbar

### 1. pg_cron

Ungeklärt. Die `POSTGRES_*`-Zugangsdaten kommen beim Pull nur als `[SENSITIVE]`,
eine direkte Datenbankverbindung ist von hier aus also nicht möglich, und der
Anon-Key darf `pg_extension` bzw. `cron.job` nicht lesen.

Im Supabase-SQL-Editor ausführen:

```sql
select extname, extversion from pg_extension where extname = 'pg_cron';
select jobid, schedule, command, active from cron.job;
```

Erwartet: eine Zeile für `pg_cron`, und ein Job
`waitlist-delete-stale-unconfirmed` mit Zeitplan `17 3 * * *`.

Kommt beim ersten Query nichts zurück, ist die Extension nicht aktiv. Dann unter
*Database → Extensions* `pg_cron` einschalten und **Migration 0004 erneut
ausführen** — sie ist wiederholbar und plant den Job dann.

Ohne den Job werden unbestätigte Anmeldungen nicht nach 30 Tagen gelöscht. Das
bricht nichts, verletzt aber die Zusage in der Datenschutzerklärung.

### 2. Bestätigungsklick und Erinnerung

Der Klick auf den Bestätigungslink lässt sich nur mit einem echten Postfach
prüfen — `delivered@resend.dev` ist eine Senke ohne Abruf. Ebenso die geplante
24-Stunden-Erinnerung.

Beides mit einer echten Adresse testen:

1. Auf `https://www.evi-health.eu` anmelden.
2. Bestätigungsmail abwarten, Absender prüfen: muss **Evi** heißen, nicht
   `hello@evi-health.eu`.
3. **Vor dem Bestätigen** in Resend unter *Emails* nachsehen: Es muss eine
   **geplante** Mail für +24 Stunden geben.
4. Bestätigen klicken → „Bestätigt. Du bist dabei."
5. In Resend prüfen: geplante Erinnerung ist **storniert**, und
   „Du bist auf der Liste." wurde versendet.
6. Über den Abmeldelink wieder aufräumen.

### 3. hello@evi-health.eu als Postfach

Weiterhin unbestätigt. Für den Versand irrelevant, aber ohne Postfach, Alias oder
Weiterleitung bei IONOS laufen Antworten auf die Bestätigungsmail ins Leere.

## Befund: Service-Role-Key im Vercel-Projekt

Im Production-Environment liegen seit heute zusätzlich:

```
SUPABASE_SERVICE_ROLE_KEY   SUPABASE_SECRET_KEY   SUPABASE_JWT_SECRET
POSTGRES_URL                POSTGRES_PASSWORD     POSTGRES_URL_NON_POOLING
POSTGRES_PRISMA_URL         POSTGRES_HOST         POSTGRES_USER
NEXT_PUBLIC_SUPABASE_ANON_KEY  NEXT_PUBLIC_SUPABASE_URL  …
```

Das ist das Standardset der Vercel-Supabase-Integration. `README.md` schließt
genau das aus:

> „Der Service-Role-Key wird von dieser App nicht gebraucht und darf nicht
> ergänzt werden."

Diese Schlüssel **umgehen Row-Level-Security vollständig** und können die
komplette Warteliste lesen — also genau die Eigenschaft aufheben, die die
Migrationen 0001–0004 herstellen. Die Anwendung liest sie nicht, aber sie stehen
jedem Code in jedem Deployment zur Verfügung, einschließlich künftiger
Abhängigkeiten.

Zusätzlich problematisch: `NEXT_PUBLIC_SUPABASE_ANON_KEY` trägt das
`NEXT_PUBLIC_`-Präfix und landet damit im Client-Bundle — die bewusste
Entscheidung, Supabase-Werte nur serverseitig zu halten, ist damit unterlaufen.

**Empfehlung:** Integration entfernen und die überflüssigen Variablen löschen.
Die App braucht ausschließlich `SUPABASE_URL` und `SUPABASE_ANON_KEY`. Ich habe
nichts davon entfernt — das Löschen integrationsverwalteter Variablen kann die
Integration selbst zerreißen und ist deine Entscheidung.
