# Plan: Warteliste live schalten mit Double-Opt-In

Stand: 2026-09-04 · Repo: `evi-landingpage` · Ziel-Deployment: Vercel-Projekt `evi-de`

---

## Ausgangslage (verifiziert)

- Der Wartelisten-Code ist **fertig und funktionsfähig**: Server Action, Validierung,
  Honeypot, RLS-Migration, Fehlerzustände.
- Das Vercel-Projekt `evi-de` hat **keine einzige Environment-Variable**
  (`vercel env ls production` → „No Environment Variables found").
- Dadurch greift `isWaitlistConfigured()` in `src/lib/waitlist/actions.ts` und
  **jede Anmeldung auf der Live-Seite wird abgelehnt.** Es wird nichts gespeichert.
- Es existiert kein Supabase-Projekt-Bezug im Repo (`.env.local` enthält nur
  `VERCEL_OIDC_TOKEN`).
- Es wird **keinerlei E-Mail versendet** — weder Bestätigung noch Double-Opt-In.
- Es gibt **keinen Freischalt-Status** in der Tabelle und **keinen Abmelde-Weg**.

Fazit: Es fehlt kein Code, es fehlt die Infrastruktur dahinter — plus DOI und
Freischalt-Workflow.

---

## Entschieden

**Verwaltung der Anmeldungen: Supabase-Dashboard, kein Google Sheet, kein eigenes Admin-UI.**

Begründung:

- Das Supabase-Dashboard kann bereits Tabellenansicht, Filter, Sortierung,
  Zeilen-Bearbeitung und CSV-Export. Für 10–20, später 50–200 Personen reicht das
  vollständig.
- Google Sheets würde einen **zweiten Auftragsverarbeiter** (Google, US) für
  personenbezogene Daten in einem mental-health-nahen Kontext einführen: neuer AVV,
  neuer Eintrag in der Datenschutzerklärung, Drittlandtransfer begründen. Es bräuchte
  einen langlebigen Service-Account-Key in der Landingpage — genau die Art Credential,
  die das aktuelle Design bewusst vermeidet. Sync-Jobs scheitern still, und zwei
  Listen driften auseinander.
- Ein eigenes Admin-Dashboard braucht Auth und einen Lese-Zugang zur Tabelle, den die
  Landingpage bewusst **nicht** hat. Es wäre zusätzliche Angriffsfläche für genau die
  Liste, die geschützt werden soll. Wenn es später eins braucht, gehört es nach
  **evi-v2**, wo Auth ohnehin existieren muss.
- Wenn eine Tabelle gebraucht wird: **CSV-Export aus Supabase**, ad hoc.

Was für „nach und nach freischalten" wirklich fehlt, ist kein UI, sondern
**Status-Spalten** (Goal 2).

---

## Architektur-Entscheidung: kein Service-Role-Key

Double-Opt-In braucht Lesen (Token nachschlagen) und Schreiben (bestätigen) — die
Landingpage hat aber bewusst nur den Anon-Key mit einer reinen INSERT-Policy, und
`README.md` schließt den Service-Role-Key ausdrücklich aus.

**Lösung: `security definer`-Funktionen (RPC) in Postgres**, die `anon` aufrufen darf.
Die Funktion macht Lookup und Update intern und gibt nur ein Status-Wort zurück — nie
eine Zeile, nie eine E-Mail-Adresse. Damit bleibt die Kern-Eigenschaft erhalten:

> Selbst wenn der Anon-Key leakt, lässt sich die Warteliste nicht auslesen.

Es wird **keine SELECT-Policy** und **kein Service-Role-Key** ergänzt.

**Token-Handling:** Die App erzeugt ein Zufalls-Token (32 Byte), speichert nur dessen
SHA-256-Hash in der DB und versendet das Klartext-Token im Link. Wer die Datenbank
liest, kann keine Bestätigungslinks erzeugen.

---

## Getroffene Entscheidungen (2026-09-04)

| # | Entscheidung | Ergebnis |
|---|---|---|
| E1 | **Domain** | Offen — muss noch gekauft werden. 5-15 EUR/Jahr bei INWX/Netcup/Hetzner. Versand von einer Subdomain, z. B. `mail.<domain>` (Resend-Empfehlung: Sende-Reputation isolieren). Blockiert nur Goal 3. |
| E2 | **Mail-Anbieter** | **Resend.** Free: 3.000 Mails/Monat, 100/Tag, 3 Domains. Konsequenz: Resend ist ein US-Anbieter, die Datenschutzerklaerung braucht einen Drittlandtransfer-Eintrag und es muss ein DPA abgeschlossen werden (Goal 4, Schritt 5). Der Versand wird trotzdem hinter ein `sendMail()`-Interface gelegt, damit ein spaeterer Wechsel auf einen EU-Anbieter eine Datei ist. |
| E3 | **Consent-IP** | **Wird nicht gespeichert.** Die Seite sagt woertlich „mehr fragen wir nicht“; eine gespeicherte IP wuerde diese Aussage brechen. Nachweis ueber `confirmation_sent_at` + `confirmed_at` + Einmal-Token. |
| E4 | **Reihenfolge** | **Goal 1 sofort**, danach 2-4. Stoppt den laufenden stillen Verlust von Anmeldungen. Die zwischen Goal 1 und Goal 3 entstandenen Zeilen bekommen einmalig eine Bestaetigungsmail (Goal 3, Schritt 10). |

---

## Voraussetzungen, die nur du erledigen kannst

- [ ] Supabase-Projekt anlegen, **Region: EU (Frankfurt)**
- [ ] Domain kaufen (E1)
- [ ] Account beim Mail-Anbieter (E2), Domain verifizieren (DNS: SPF, DKIM, DMARC)
- [ ] AVV/DPA beim Mail-Anbieter abschließen

---

# Goals

Jeder Goal ist ein eigenständiges Acceptance Target. Zusätzlicher Scope wird nicht
stillschweigend mitgebaut.

## Goal 1 — Die Warteliste speichert echte Anmeldungen — ERLEDIGT (2026-09-04)

**Acceptance Target:** Eine Anmeldung auf `https://evi-de.vercel.app` erzeugt eine Zeile
in `public.waitlist_signups`. Eine zweite Anmeldung mit derselben Adresse erzeugt
denselben Erfolgsbildschirm und keine zweite Zeile. Fehlende Konfiguration führt weiter
zu einer echten Fehlermeldung, nie zu einem vorgetäuschten Erfolg.

**Stand:**

- Supabase-Projekt `evi-waitlist`, Ref `lxaaebwcyknhhkjpafvr`, Region `eu-central-1`,
  Migrationen 0001 und 0002 eingespielt.
- `SUPABASE_URL` und `SUPABASE_ANON_KEY` in Vercel als Typ `Config` gesetzt.
  **Nicht `Secret`** — dieser Typ ist von `vercel env pull` ausgeschlossen, wodurch
  `npm run verify:waitlist` die Werte lokal nie sehen könnte.
- Preflight gegen das echte Projekt: alles grün, inklusive des Nachweises, dass sich die
  Warteliste mit dem öffentlichen Key **nicht auslesen** lässt. Der
  `sb_publishable_`-Key funktioniert mit supabase-js.
- Produktion neu gebaut per `vercel redeploy` des Deployments von Commit `6181607`.

**Wichtig — es wurde bewusst NICHT der Arbeitsstand deployt.** Der enthält die
Goal-3/4-Änderungen: Die umgebaute Server Action ruft die RPCs aus Migration 0003 auf und
verlangt `RESEND_API_KEY`, `WAITLIST_MAIL_FROM` und `WAITLIST_TOKEN_SECRET`. Nichts davon
existiert bisher, ein Deploy des Arbeitsstands würde also jede Anmeldung ablehnen.

**Im echten Browser gegen die Produktionsseite verifiziert:**

| Test | Ergebnis |
| --- | --- |
| Neue Anmeldung | „Du bist dabei." — Insert hat Supabase erreicht |
| Dieselbe Adresse, andere Groß-/Kleinschreibung | derselbe Erfolgsbildschirm, keine zweite Zeile |
| `keine-mail-adresse` | vom Browser abgefangen (`type="email"` + `required`) |
| `a@b` — Browser lässt durch | „Diese E-Mail-Adresse sieht nicht ganz richtig aus." — Serverprüfung greift |

Ein erster Testversuch per handgebautem RSC-Action-Request scheiterte mit HTTP 500. Die
Vercel-Logs zeigten `Failed to parse body as FormData` und `Connection closed` — Fehler in
der nachgebauten Anfrage, nicht in der Anwendung. Deshalb der echte Browser.

**Offen:** Die Testzeile `preflight-test-2026-09-04@example.com` muss im
Supabase-Table-Editor gelöscht werden. Der Anon-Key kann das nicht — genau so ist es
gewollt.

**Risiko vor dem Bewerben der Seite:** Free-Projekte pausieren nach 7 Tagen ohne
Anfragen. Supabase bekommt nur bei Anmeldungen Anfragen — gerade in der Anfangsphase
pausiert das Projekt also, und die erste echte Anmeldung danach schlägt fehl. Entweder
Pro, oder etwas, das den Pfad regelmäßig wachhält.

---

## Goal 2 — Freischalten in Wellen ist möglich — ERLEDIGT (2026-09-04)

**Acceptance Target:** Im Supabase-Table-Editor lässt sich nach `status = 'pending'`
filtern, nach `created_at` sortieren, und der Status einer Zeile auf `invited` setzen.
Bestehende Zeilen behalten ihre Daten.

**Umgesetzt in `supabase/migrations/0002_waitlist_status.sql`:**

- `status` (Check-Constraint auf `unconfirmed|pending|invited|joined|declined`),
  `confirmed_at`, `invited_at`
- Index `(status, created_at desc)` — verifiziert, dass die Workflow-Query ihn nutzt
- Trigger `waitlist_stamp_invited_at`: stempelt `invited_at` automatisch, sobald der
  Status auf `invited` wechselt
- Verschärfte INSERT-Policy: `anon` darf nur noch Zeilen mit `status = 'pending'` und
  leeren `confirmed_at`/`invited_at` anlegen
- Workflow dokumentiert in `README.md` → „Einladungen freischalten"

**Drei bewusste Abweichungen vom ursprünglichen Plan:**

1. **Kein `note`-Feld.** Migration 0001 verbietet ausdrücklich Freitext-Spalten
   („no free text"). Eine Betreiber-Notiz wäre genau so eine Spalte und damit ein Ort,
   an dem versehentlich Sensibles landet. Wenn Notizen gebraucht werden, ist das eine
   eigene Entscheidung mit eigener Begründung — nicht etwas, das nebenbei mitkommt.
2. **`status` startet mit Default `'pending'`, nicht `'unconfirmed'`.** Vor Goal 3
   existiert kein Double-Opt-In, also ist jede gespeicherte Anmeldung eine echte.
   Default `'unconfirmed'` hätte alle Live-Anmeldungen hinter einem Filter versteckt,
   den nichts hätte auflösen können. Migration 0003 zieht den Default auf
   `'unconfirmed'` um, sobald DOI existiert.
3. **Der separate UPDATE für Bestandszeilen entfällt.** Der Spalten-Default setzt
   vorhandene Zeilen automatisch auf `'pending'` — lokal gegen eine befüllte Tabelle
   verifiziert.

**Lokal verifiziert gegen PostgreSQL 18.6** (Wegwerf-Cluster, danach entfernt):

| Test | Ergebnis |
| --- | --- |
| Insert wie die Server Action, ohne `status` | OK, `status = 'pending'` |
| Zweite Anmeldung, andere Groß-/Kleinschreibung | SQLSTATE `23505` — genau der Code, den `actions.ts` als Erfolg behandelt |
| `anon` trägt sich als `invited` ein | RLS-Verstoß |
| `anon` setzt `confirmed_at` | RLS-Verstoß |
| `anon` liest die Liste | 0 Zeilen |
| `anon` ändert / löscht | 0 Zeilen betroffen |
| Status auf `invited` setzen | `invited_at` automatisch gestempelt |
| Ungültiger Status | Check-Constraint greift |
| Workflow-Query | nutzt `waitlist_signups_status_created_at_idx` |
| 0002 auf befüllte Tabelle | Bestandszeilen → `pending`, Daten intakt |

---

## Goal 3 — Double-Opt-In mit Bestätigungsmail — CODE FERTIG, wartet auf Domain

**Acceptance Target:** Eine Anmeldung erzeugt eine Zeile mit `status='unconfirmed'` und
versendet eine Bestätigungsmail. Erst der Klick auf den Bestätigen-Button setzt
`confirmed_at` und `status='pending'`. Ein Token ist einmalig und läuft nach 7 Tagen ab.
Ein Link-Prefetch durch Mail-Scanner bestätigt **nicht**. Ohne Mail-Konfiguration
schlägt die Anmeldung mit echter Fehlermeldung fehl — kein stiller Teil-Erfolg.

**Umgesetzt (2026-09-04):**

| Datei | Inhalt |
| --- | --- |
| `supabase/migrations/0003_waitlist_double_opt_in.sql` | Token-Spalten, drei RPCs, Default `unconfirmed`, Entzug aller direkten Tabellenrechte von `anon` |
| `src/lib/waitlist/tokens.server.ts` | Token erzeugen (32 Byte) und als Hex-SHA-256 hashen |
| `src/lib/mail/send.server.ts` | Resend über REST, ohne neue Dependency, Timeout, ohne Empfänger im Log |
| `src/lib/mail/templates/confirm-waitlist.ts` | HTML- und Textfassung, ohne Tracking-Pixel |
| `src/lib/waitlist/actions.ts` | RPC statt Direkt-Insert, danach Versand |
| `src/lib/waitlist/confirm.ts` | Bestätigung als Server Action mit Redirect |
| `src/app/warteliste/bestaetigen/page.tsx` | GET zeigt Button, POST bestätigt |
| `src/components/waitlist/waitlist-success.tsx` | „Schau in dein Postfach" statt „Du bist dabei" |

**Eine wichtige Abweichung vom Plan: `confirmation_delivered_at` ist neu.**

Der Plan sah einen Zeitstempel vor. Beim Schreiben der Action zeigte sich, dass das
einen Fake-Success erzeugt: Scheitert der Versand, wäre `confirmation_sent_at` trotzdem
gesetzt, der Wiederholungsversuch liefe in die 5-Minuten-Sperre, bekäme `throttled` —
und die Seite zeigt den Erfolgsbildschirm für eine Mail, die nie rausging. Jetzt steuert
`confirmation_sent_at` den Ablauf nach 7 Tagen und `confirmation_delivered_at` die
Sperre. Ein fehlgeschlagener Versand ist sofort wiederholbar.

**Zweite Abweichung: der Token wird beim Bestätigen nicht gelöscht.**

Der Plan sagte löschen. Dann liefert aber jeder zweite Klick — Doppelklick, Reload,
Mail auf einem zweiten Gerät geöffnet — „ungültiger Link" an jemanden, der alles richtig
gemacht hat. Stattdessen entscheidet `confirmed_at`, und die Funktion antwortet
`already`. Ein Token auf einer bestätigten Zeile kann nichts weiter auslösen.

**Lokal verifiziert gegen PostgreSQL 18.6:**

| Test | Ergebnis |
| --- | --- |
| Neue Anmeldung | `send`, Zeile `unconfirmed`, Token gesetzt |
| Sofort nochmal | `throttled` (nur nach echtem Versand) |
| Versand scheitert, sofortiger zweiter Versuch | `send` — **nicht** blockiert |
| Bestätigen mit falschem Token / Müll | `invalid` |
| Bestätigen mit richtigem Token | `confirmed`, `status='pending'` |
| Doppelklick auf Bestätigen | `already` |
| Erneut anmelden nach Bestätigung | `already_confirmed` |
| Token 8 Tage alt | `expired` |
| Alter Token nach erneutem Versand | `invalid` |
| `anon` INSERT/SELECT/UPDATE/DELETE direkt | jeweils `permission denied` |
| Nicht-Hex-Token einschleusen | Check-Constraint greift |

**Im gebauten Server verifiziert:**

- `GET …?token=…` rendert nur einen Button, `method="POST"` — ein Prefetch durch
  Mail-Scanner kann nicht bestätigen
- `noindex, nofollow` gesetzt
- POST **ohne JavaScript** funktioniert (303 auf `?status=…`), der Token verschwindet
  dabei aus URL, Verlauf und Referer
- Ohne Konfiguration: `unavailable` statt vorgetäuschtem Erfolg
- Alle fünf Ergebniszustände rendern, unbekannter Status fällt auf `invalid` zurück

**Offen, blockiert durch die Domain:**

1. `RESEND_API_KEY` und `WAITLIST_MAIL_FROM` in Vercel setzen.
2. Migration 0003 in Supabase einspielen — **erst zusammen mit Schritt 1**, weil danach
   jede Anmeldung ohne Mailversand abgelehnt wird.
3. Einmalig eine Bestätigungsmail an die Zeilen aus der Goal-1-Phase (`status='pending'`,
   `confirmed_at is null`).
4. Echter Versandtest an eine reale Adresse.

---

## Goal 4 — Abmelden, Aufbewahrung, Datenschutz — CODE FERTIG

**Acceptance Target:** Jede versendete Mail enthält einen funktionierenden
Abmelde-Link, der die Zeile löscht. Unbestätigte Zeilen werden nach 30 Tagen
automatisch entfernt. Die Datenschutzerklärung beschreibt den tatsächlichen Stand.

**Umgesetzt (2026-09-04):**

| Datei | Inhalt |
| --- | --- |
| `supabase/migrations/0004_…sql` | `waitlist_unsubscribe`, `waitlist_delete_stale_unconfirmed`, `pg_cron`-Job |
| `src/lib/waitlist/unsubscribe.ts` | Abmeldung als Server Action mit Redirect |
| `src/app/warteliste/abmelden/page.tsx` | GET zeigt Button, POST löscht |
| `src/lib/waitlist/tokens.server.ts` | `unsubscribeTokenFor()` — HMAC statt Zufall |
| `src/lib/mail/send.server.ts` | Unterstützt zusätzliche RFC-Header |
| `src/lib/mail/templates/confirm-waitlist.ts` | Abmeldelink + `List-Unsubscribe` |
| `src/app/datenschutz/page.tsx` | DOI-Verfahren, Resend inkl. USA-Transfer, Speicherdauern, Abmeldeweg |

**Ein Fehler aus Goal 3, der hier aufgefallen ist:** `actions.ts` schrieb
`hashToken(createToken())` — das Roh-Token wurde sofort verworfen, es hätte also
nie ein Abmeldelink daraus entstehen können. Behoben.

**Abweichung vom Plan: der Abmelde-Token ist abgeleitet, nicht zufällig.**
Ein Zufalls-Token müsste bei jedem erneuten Versand neu vergeben werden, wodurch
der Link in jeder früheren Mail still kaputtginge. Er wird jetzt als
`HMAC-SHA256(WAITLIST_TOKEN_SECRET, adresse)` gebildet: in jeder Mail derselbe,
aus der Datenbank nicht fälschbar. Kostet eine zusätzliche Umgebungsvariable.

**Zweite Abweichung: `List-Unsubscribe` ohne `List-Unsubscribe-Post`.**
One-Click nach RFC 8058 braucht einen POST-Endpunkt. Den anzukündigen, ohne ihn
zu haben, wäre schlechter als ihn wegzulassen. Muss vor dem ersten echten
Newsletter-Versand ergänzt werden.

**Lokal verifiziert gegen PostgreSQL 18.6:**

| Test | Ergebnis |
| --- | --- |
| Abmelden mit gültigem Token | `removed`, Zeile gelöscht |
| Derselbe Link nochmal | `not_listed` — gleiche Antwort wie bei unbekanntem Token |
| Müll-Token | `invalid` |
| Aufräumen: unbestätigt, 31 Tage alt | gelöscht |
| Aufräumen: unbestätigt, 3 Tage alt | bleibt |
| Aufräumen: `pending` aus Goal-1-Zeit, 90 Tage alt | **bleibt** |
| Aufräumen: `invited`, 90 Tage alt | bleibt |
| `anon` ruft Aufräumfunktion auf | `permission denied` |
| Migration ohne `pg_cron` | läuft durch, meldet den fehlenden Job |
| HMAC-Token | schreibweise-unabhängig, URL-sicher, Hash erfüllt DB-Constraint |

**Im gebauten Server verifiziert:** `/warteliste/abmelden` rendert nur einen
Button, `method="POST"`, `noindex, nofollow`; POST ohne JavaScript liefert 303;
ohne Konfiguration `unavailable` statt stillem Erfolg; alle Zustände rendern,
unbekannter Status fällt auf `not_listed` zurück. Die Datenschutzseite enthält
die neuen Abschnitte.

**Offen:** `WAITLIST_TOKEN_SECRET` in Vercel setzen, `pg_cron` aktivieren,
und die Datenschutzerklärung muss weiterhin juristisch geprüft und um
verantwortliche Stelle, Rechtsgrundlagen und den AVV mit Resend ergänzt werden.

---

## Ausdrücklich nicht in diesem Plan

- Kein eigenes Admin-Dashboard.
- Keine Google-Sheets-Anbindung.
- Kein Service-Role-Key in der Landingpage.
- Keine SELECT-Policy auf `waitlist_signups`.
- Kein Versand der eigentlichen Alpha-Einladungen — die gehört nach evi-v2, sobald
  dort Invite-Codes existieren.
- Keine Gesundheitsdaten. Die Tabelle bekommt niemals Spalten für Diagnosen,
  Symptome, Medikamente, Therapie oder Freitext.

---

## Launch-Blocker außerhalb dieses Goals

Beim Prüfen aufgefallen, gehört nicht zur Warteliste, sollte aber **vor** dem
Bewerben der Seite entschieden werden:

- **`ACUTE_HELP_RESOURCES` in `src/lib/constants.ts` ist leer.** `/akute-hilfe` zeigt
  dadurch nur generische Hinweise ohne eine einzige Krisennummer. Der Kommentar dort
  sagt richtig, dass eine falsche Nummer aktiv gefährlich wäre — aber wenn du Traffic
  auf eine Mental-Health-Seite lenkst, sollten dort verifizierte Nummern stehen.
- **`SOCIAL` in `src/lib/constants.ts` sind Platzhalter** (`https://instagram.com/`,
  `https://tiktok.com/`, `https://linkedin.com/`). Die Footer-Links führen ins Leere.
