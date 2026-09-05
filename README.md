# Evi Landingpage

Early-Access-Landingpage für **Evi** — deutschsprachig, mobil zuerst, mit
Supabase-Warteliste und einwilligungsbasierter PostHog-Messung.

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4

---

## Schnellstart

```bash
npm ci
cp .env.example .env.local   # Werte eintragen, siehe unten
npm run dev                  # http://localhost:3000
```

| Befehl              | Zweck                          |
| ------------------- | ------------------------------ |
| `npm run dev`       | Entwicklungsserver             |
| `npm run build`     | Produktions-Build              |
| `npm start`         | Produktions-Server             |
| `npm run lint`      | ESLint                         |
| `npm run typecheck` | TypeScript ohne Emit           |
| `npm run verify:waitlist` | Preflight: würde eine echte Anmeldung gespeichert? |

> `npm run typecheck` braucht einmalig einen `npm run build`, weil Next.js die
> Routen-Typen (`LayoutProps`, `PageProps`) generiert.

---

## Umgebungsvariablen

Siehe `.env.example`. Kurz:

| Variable                  | Pflicht | Zweck                                          |
| ------------------------- | ------- | ---------------------------------------------- |
| `SUPABASE_URL`            | ja      | Supabase-Projekt-URL (nur serverseitig)        |
| `SUPABASE_ANON_KEY`       | ja      | Anon-Key; ab Migration 0003 nur noch RPC-Aufrufe |
| `RESEND_API_KEY`          | ja¹     | Versand der Bestätigungsmail                   |
| `WAITLIST_MAIL_FROM`      | ja¹     | Absender, z. B. `Evi <hallo@mail.example.de>`  |
| `WAITLIST_TOKEN_SECRET`   | ja¹     | Leitet Abmelde-Tokens ab (`openssl rand -base64 32`) |
| `CRON_SECRET`             | ja      | Schützt `/api/keep-alive`; ohne den Wert antwortet die Route 503 |
| `OPENAI_API_KEY`          | nein²   | "Frag Evi selbst"-Chat (`/api/evi-chat`)       |
| `OPENAI_MODEL`            | nein    | Standard: `gpt-5.6-luna`                       |
| `NEXT_PUBLIC_POSTHOG_KEY` | nein    | Ohne Key wird keine Statistik geladen          |
| `NEXT_PUBLIC_POSTHOG_HOST`| nein    | Standard: `https://eu.i.posthog.com`           |
| `NEXT_PUBLIC_SITE_URL`    | s. u.   | Basis-URL für Canonical, Open Graph, Sitemap   |

¹ Ab Migration 0003 Pflicht. Eine Anmeldung, die nicht bestätigt werden kann,
ist keine Anmeldung — fehlt der Mailversand, lehnt das Formular die Anmeldung
mit einer echten Fehlermeldung ab.

² Ohne Key zeigt der Chat nur seinen ehrlichen Fallback-Text (Verweis auf
Instagram/E-Mail) statt einer echten Antwort — kein Demo-Fallback, keine
erfundene Antwort.

### Wie die Site-URL bestimmt wird

Zieladresse: **https://evi-de.vercel.app** — erreicht, indem das Vercel-Projekt
`evi-de` heißt. Es ist **keine Domain fest im Code hinterlegt**;
`src/lib/constants.ts` löst der Reihe nach auf:

1. `NEXT_PUBLIC_SITE_URL` — sobald eine eigene Domain existiert, hier eintragen
2. `VERCEL_PROJECT_PRODUCTION_URL` — setzt Vercel bei echten Projekten selbst
3. `VERCEL_URL` — das konkrete Deployment
4. `http://localhost:3000` — nur Entwicklung, plus laute Warnung im Log

**Stolperfalle:** Bei *anonymen* Deployments (`vercel deploy --temporary`, ohne
Login) setzt Vercel keine dieser Variablen, und die URL steht erst nach dem Build
fest. Canonical und Open Graph zeigen dann auf localhost — die Seite
funktioniert, aber **Link-Vorschauen auf TikTok, Instagram und WhatsApp bleiben
leer**. Sobald das Deployment beansprucht oder aus einem echten Vercel-Projekt
deployt wird, löst sich das automatisch über Schritt 2. Alternativ die Variable
explizit setzen.

**Bewusst ohne `NEXT_PUBLIC_`:** Die Supabase-Werte werden nur in einer Server
Action gelesen und landen dadurch nie im Client-Bundle. Der Service-Role-Key
wird von dieser App nicht gebraucht und darf nicht ergänzt werden.

Fehlen die Supabase-Werte, lehnt das Formular die Anmeldung mit einer echten
Fehlermeldung ab. Es gibt keinen Demo-Fallback und keinen vorgetäuschten Erfolg.

---

## Datenbank einrichten

Die Dateien in `supabase/migrations/` **in Reihenfolge** im Supabase-SQL-Editor
ausführen (oder via Supabase CLI):

| Migration | Legt an |
| --------- | ------- |
| `0001_create_waitlist_signups.sql` | Tabelle `waitlist_signups`, Unique-Index auf `lower(email)`, RLS mit **nur** einer INSERT-Policy für `anon` |
| `0002_waitlist_status.sql` | `status`, `confirmed_at`, `invited_at`, Index für den Einladungs-Workflow, Auto-Stempel für `invited_at`, verschärfte INSERT-Policy |
| `0003_waitlist_double_opt_in.sql` | Double-Opt-In: Token-Spalten, die drei RPC-Funktionen, Default `unconfirmed` — und **entzieht `anon` jeden direkten Tabellenzugriff** |
| `0004_waitlist_unsubscribe_and_retention.sql` | Abmelde-Funktion, Aufräumfunktion für unbestätigte Zeilen, `pg_cron`-Job (falls verfügbar) |
| `0005_waitlist_confirmation_receipt.sql` | Versendet nach erfolgreicher Bestätigung einmalig die transaktionale Mail „Du bist auf der Liste.“ und protokolliert ihre Annahme durch Resend |
| `0006_waitlist_confirmation_reminder.sql` | Plant nach der Anmeldung einmalig eine Erinnerung nach 24 Stunden und storniert sie bei rechtzeitiger Bestätigung |

Beide sind idempotent (`if not exists` / `drop … if exists`) und wurden lokal
gegen PostgreSQL 18 verifiziert, auch der Upgrade-Pfad auf eine bereits
befüllte Tabelle.

Es gibt absichtlich **keine** SELECT-Policy: Selbst mit dem öffentlichen Key
lässt sich die Warteliste nicht auslesen. Zum Lesen das Supabase-Dashboard
verwenden.

### Verkabelung prüfen

```bash
npx vercel env pull .env.local   # prüft die deployte Konfiguration statt einer lokalen
npm run verify:waitlist
```

Das Skript beantwortet die eine Frage, die vor dem Bewerben der Seite zählt:
**würde eine echte Anmeldung gespeichert?** Es prüft Erreichbarkeit, beide
Migrationen und dass sich die Liste mit dem öffentlichen Key nicht auslesen
lässt.

Es **schreibt nichts**. Beide Sonden verletzen absichtlich eine Regel, die die
Datenbank erzwingt — die Zeile entsteht also nie, interessant ist nur, *welche*
Regel gegriffen hat. Eine Sonde, die durchgeht, bedeutet, dass die Datenbank
nicht durchsetzt, was sie soll, und wird als Fehler gemeldet.

Gespeichert werden ausschließlich: E-Mail, optionaler Vorname, Zeitstempel,
Locale, UTM-Parameter, Referrer, der optionale Marketing-Consent und der
Bearbeitungsstatus. **Keine Gesundheitsdaten** — das Formular fragt nichts dazu,
und die Tabelle hat keine Spalte dafür. Auch keine Freitext-Spalte, in die so
etwas versehentlich geraten könnte. Das soll so bleiben.

---

## Double-Opt-In

Ab Migration 0003 ist eine abgeschickte Anmeldung noch keine Anmeldung. Ablauf:

1. Formular abgeschickt → Zeile mit `status = 'unconfirmed'` und einem
   Bestätigungs-Token, dann Versand der Mail.
2. Die Mail enthält einen Link auf `/warteliste/bestaetigen?token=…`.
3. Der Link **zeigt nur einen Button**. Erst dessen Absenden (POST) bestätigt.
4. Bestätigt → `confirmed_at` gesetzt, `status = 'pending'`, ab jetzt
   einladbar.
5. Danach verschickt Resend die Aufnahmebestätigung „Du bist auf der Liste.“.
   Die Version im Code entspricht der veröffentlichten Resend-Vorlage mit dem
   Alias `evi-early-access-confirmed`.

Wenn nach 24 Stunden noch keine Bestätigung vorliegt, verschickt Resend genau
eine Erinnerung mit demselben, insgesamt 7 Tage gültigen Link. Die Erinnerung
wird bereits bei der ersten Anmeldung zeitversetzt geplant. Sobald die Person
bestätigt, storniert die Server Action die geplante Resend-Mail. Dafür braucht
es weder einen zusätzlichen Cron-Job noch einen Service-Role-Key.

**Warum der Link nicht selbst bestätigt:** Outlook Safe Links, Firmen-Gateways
und Virenscanner rufen jede URL in einer eingehenden Mail ab, bevor der
Empfänger sie sieht. Ein Confirm-on-GET würde dadurch Anmeldungen bestätigen,
denen niemand zugestimmt hat — genau das, was Double-Opt-In verhindern soll.

**Warum es zwei Zeitstempel gibt:** `confirmation_sent_at` ist die Ausstellung
des Tokens (steuert den Ablauf nach 7 Tagen), `confirmation_delivered_at` die
Annahme durch den Mailanbieter (steuert die 5-Minuten-Sperre gegen erneuten
Versand). Wären es eine Spalte, würde ein fehlgeschlagener Versand die Sperre
starten: der Mensch versucht es erneut, bekommt „throttled" und damit den
Erfolgsbildschirm für eine Mail, die nie rausging.

**Keine Leseberechtigung, kein Service-Role-Key.** Bestätigen braucht Lookup
und Update, die App hat aber nur den Anon-Key. Beides läuft deshalb über
`security definer`-Funktionen, die ein einzelnes Statuswort zurückgeben und nie
eine Zeile. Nach 0003 hat `anon` **keinen** direkten Tabellenzugriff mehr —
weder lesend noch schreibend.

---

## Logo im Posteingang

Damit Gmail neben dem Absender das Maskottchen zeigt statt eines grauen Kreises,
braucht es **BIMI** — zwei DNS-Einträge, eine DMARC-Policy auf `quarantine` oder
`reject` und ein SVG im Profil *Tiny Portable/Secure*.

```bash
npm run verify:bimi
```

Prüft die Logodatei gegen die Formatregeln, die DMARC-Kette, SPF/DKIM und den
BIMI-Eintrag. Stand heute meldet es zwei offene Punkte: `_dmarc` wird noch von
IONOS verwaltet und steht auf `p=none`.

Der volle Ablauf inklusive der Kostenfrage — Gmail zeigt BIMI **nur mit
kostenpflichtigem VMC/CMC-Zertifikat** — steht in
`docs/runbook-logo-in-mailclients.md`.


## Keep-Alive-Cron

Free-Projekte bei Supabase pausieren nach etwa einer Woche ohne Anfragen. Die
Landingpage liegt auf Vercel und läuft davon unabhängig weiter — die Datenbank
sieht also nur dann Verkehr, wenn sich jemand anmeldet. Genau die ruhige Phase
nach dem Start ist damit die, in der das Projekt pausiert, und die erste echte
Anmeldung danach ist die, die fehlschlägt.

`vercel.json` plant deshalb täglich um 06:00 UTC einen Aufruf von
`/api/keep-alive`. Die Route stellt eine Anfrage an die Datenbank, die durch RLS
abgewiesen wird und leer zurückkommt — sie **liest und schreibt nichts**, das
reicht aber als Aktivität.

Sie ist zugleich Monitoring: Eine Antwort außerhalb von 2xx erscheint im
Vercel-Cron-Log. Das ist der Unterschied zwischen „Anmeldepfad ist kaputt, ich
weiß es" und „seit zwei Wochen hat sich niemand angemeldet, warum eigentlich".

`CRON_SECRET` ist **Pflicht**. Vercel hängt den Wert als
`Authorization: Bearer …` an geplante Aufrufe. Fehlt die Variable, antwortet die
Route mit 503 und verweigert den Dienst, statt einen offenen Endpunkt
auszuliefern, den jeder gedrückt halten kann.

> Der Hobby-Plan von Vercel erlaubt tägliche Cron-Ausführungen. Für eine
> Wochengrenze ist täglich reichlich Puffer.

---

## Abmelden und Aufbewahrung

**Abmelden.** Jede Mail enthält einen Abmeldelink auf `/warteliste/abmelden`.
Der Link zeigt — wie die Bestätigung — nur einen Button; erst der POST löscht.
Gelöscht wird die **ganze Zeile**: Es gibt nichts zu behalten, und eine
Restliste von Menschen, die vergessen werden wollten, wäre ihr eigenes
Datenschutzproblem.

Der Abmelde-Token ist **nicht zufällig**, sondern aus `WAITLIST_TOKEN_SECRET`
und der Adresse abgeleitet. Sonst müsste er bei jedem erneuten Versand neu
erzeugt werden und der Link in jeder früheren Mail würde still kaputtgehen —
ein Abmeldelink, der jemandem „du stehst nicht auf der Liste" antwortet,
obwohl er darauf steht, ist schlimmer als keiner. **Ein Wechsel des Secrets
entwertet jeden je verschickten Abmeldelink.**

Der `List-Unsubscribe`-Header wird als URL gesetzt, bewusst **ohne**
`List-Unsubscribe-Post`: One-Click-Abmeldung nach RFC 8058 braucht einen
POST-Endpunkt, und einen anzukündigen, den es nicht gibt, wäre schlechter als
ihn nicht anzubieten. Vor dem ersten echten Newsletter-Versand muss er ergänzt
werden.

**Aufbewahrung.** `waitlist_delete_stale_unconfirmed()` löscht Zeilen mit
`status = 'unconfirmed'`, die älter als 30 Tage sind. Zeilen aus der Zeit vor
Double-Opt-In tragen `status = 'pending'` und bleiben davon unberührt.

Migration 0004 plant den Job über `pg_cron` (täglich 03:17 UTC), **sofern die
Extension aktiviert ist**. Ist sie es nicht, gibt die Migration einen Hinweis
aus und läuft trotzdem durch — dann passiert aber auch kein automatisches
Löschen. Aktivieren unter *Database → Extensions → pg_cron*, danach Migration
0004 erneut ausführen.

---

## Einladungen freischalten

Es gibt bewusst **kein eigenes Admin-Dashboard**. Der Supabase-Table-Editor ist
die Verwaltungsoberfläche — Begründung in
`docs/waitlist-go-live-plan.md`.

Statuswerte von `waitlist_signups.status`:

| Wert | Bedeutung |
| --- | --- |
| `unconfirmed` | Double-Opt-In-Mail verschickt, noch nicht bestätigt (ab Migration 0003) |
| `pending` | Auf der Liste, wartet auf eine Einladung |
| `invited` | Einladung verschickt |
| `joined` | Einladung angenommen und registriert |
| `declined` | Möchte nicht eingeladen werden |

**Workflow für eine Einladungswelle:**

1. Im Supabase-Table-Editor `waitlist_signups` öffnen.
2. Nach `status = 'pending'` filtern, nach `created_at` aufsteigend sortieren.
3. Die ältesten N Personen einladen (der Versand passiert nicht hier — die
   eigentlichen Alpha-Einladungen gehören nach evi-v2).
4. Bei diesen Zeilen `status` auf `invited` setzen. **`invited_at` nicht von
   Hand füllen** — ein Trigger stempelt den Zeitpunkt automatisch, sobald der
   Status auf `invited` wechselt. Ein von Hand gesetztes falsches Datum wäre
   schlimmer als keines, weil es entscheidet, wer schon kontaktiert wurde.
5. Wer sich registriert hat, wird auf `joined` gesetzt.

Der Anon-Key kann diese Felder nicht setzen: Die INSERT-Policy aus Migration
0002 akzeptiert nur Zeilen mit `status = 'pending'` und leeren
`confirmed_at`/`invited_at`. Diese Zustände setzt ausschließlich ein Mensch im
Dashboard.

Für eine Tabelle außerhalb von Supabase: **CSV-Export** im Table-Editor. Es gibt
bewusst keine Google-Sheets-Anbindung (das wäre ein zweiter
Auftragsverarbeiter für personenbezogene Daten und ein zweiter Ort, an dem die
Liste liegt).

---

## Analytics

PostHog wird **erst nach Zustimmung** im Consent-Banner geladen. Bewusst
restriktiv konfiguriert (`src/lib/analytics/analytics-provider.tsx`):

- `autocapture: false` — kein automatisches Erfassen von Klicks und Texten
- `disable_session_recording: true` — keine Aufzeichnung von Eingaben
- Zusätzlich filtert `src/lib/analytics/events.ts` über eine Allowlist, welche
  Property-Keys überhaupt gesendet werden dürfen.

Formularinhalte (E-Mail, Vorname) werden nie übertragen.

Events: `landing_page_view`, `hero_early_access_click`,
`navbar_early_access_click`, `early_access_section_view`,
`waitlist_form_start`, `waitlist_submit_success`, `waitlist_submit_error`,
`instagram_click`, `tiktok_click`, `linkedin_click` sowie
`early_access_click` (mit `location`) für weitere CTA-Platzierungen.

Attribution (UTM + Referrer) wird beim ersten Seitenaufruf erfasst,
First-Touch-basiert in `sessionStorage` gehalten und sowohl an die
Supabase-Zeile als auch an die Events gehängt.

---

## Designsystem

Umgesetzt nach `Design.md` (Original liegt unter
`~/Desktop/evi-v2/Evi/Design.md`): Farb-, Typo-, Spacing-, Shadow- und
Motion-Tokens stammen unverändert daraus. Glassmorphismus, Pill-Radien,
schwebende Navbar und der 120/64-px-Sektionsrhythmus ebenso.

Schrift: **Plus Jakarta Sans**, geladen über `next/font` statt per
Google-Fonts-`@import`. Gleiche Schrift, aber selbst gehostet — der Browser der
Besucher:innen ruft Google nie auf, was bei einer Mental-Health-Seite zählt.

### Markenassets

Verbindlich ist `public/assets/logo-mascot.png`. Alle anderen Maskottchen-Dateien
sind Ableitungen davon und tragen **dieselben** Farben:

| | Verlauf oben → unten | Herz | Augenring |
| --- | --- | --- | --- |
| Maskottchen | `#FDA9F9` → `#FF6769` | `#9491DF` | `#FAFFDF` |

- `public/assets/logo-mascot.png` — Maskottchen, **unveränderte** Originalfarben
- `public/assets/logo-mascot-og.png` — Zuschnitt für das Open-Graph-Bild
- `public/assets/evi-logo-email.png` — Lockup für den Mailkopf
- `public/assets/evi-bimi.svg` — Absenderlogo für den Posteingang, siehe oben.
  Aus dem Maskottchen vektorisiert, Kontur mit 0,19 % Abweichung
- `src/app/icon.png`, `src/app/apple-icon.png` — Favicon / Touch-Icon
- `public/assets/wordmark-black.png` / `wordmark-white.png` — identische
  Buchstabenformen, nur die Füllung unterscheidet sich

> Wer das Maskottchen austauscht, muss **alle sechs** Dateien mitziehen —
> `npm run verify:bimi` prüft nur das Format des SVG, nicht seine Ähnlichkeit
> zum PNG.

Regel im Code (`src/components/brand/logo.tsx`): Das Maskottchen wird nie
umgefärbt, entsättigt, invertiert oder verzerrt — ein Drop-Shadow ist der
einzige erlaubte Effekt. Nur die Wortmarke wechselt über
`<Logo background="light" | "dark" />`.

### Drei Abweichungen von Design.md — jeweils wegen Kontrast

Design.md ist ansonsten 1:1 umgesetzt. Diese drei Werte fallen durch die
WCAG-Prüfung und sind im Code mit `A11Y` markiert:

| Design.md | Problem | Umgesetzt | Ergebnis |
| --- | --- | --- | --- |
| CTA: weiß auf `--gradient-brand` | **2,59–3,38:1** | `--gradient-cta`, dieselbe Rampe abgedunkelt | **5,13:1** |
| Schrittziffern `--orange-300` | **1,83:1** | `--orange-600` | **3,21:1** |
| Formularrahmen `--color-border` | **1,70:1** | `--color-border-strong` | **4,47:1** |

`--gradient-brand` bleibt im Original erhalten, ist aber **rein dekorativ**
(Blobs, Punkte). Weißer Text darauf läge bei 2,60:1 — deshalb steht nie ein
Label oder Icon darauf.

---

## Verifiziert

- Build, ESLint und TypeScript sauber
- Kein horizontales Overflow bei 375 / 768 / 1024 / 1440 px
- axe-core: 0 Verstöße (WCAG 2.1 A + AA) auf allen vier Seiten, Desktop + Mobil
- Kontraste rechnerisch und am gerenderten Pixel geprüft, inklusive der
  Glasflächen (Hero-Karte 5,43:1 für Sekundärtext, dunkles Glas 9,11:1)
- Fokusring sichtbar (`#5B52BF`, 2 px) bei Tastaturnavigation
- `prefers-reduced-motion` und Betrieb ohne JavaScript: Inhalte bleiben sichtbar,
  das Formular funktioniert weiterhin
- Formularpfade gegen einen Supabase-Mock geprüft: Erfolg, ungültige E-Mail,
  Duplikat (wird als Erfolg behandelt, verrät keine Registrierung),
  fehlende Konfiguration (echter Fehler), Honeypot (speichert nichts)
- Supabase-Code kommt in keinem Client-Bundle vor

---

## Vor dem Launch noch zu erledigen

Diese Punkte sind **absichtlich** offen gelassen, statt sie zu erfinden:

1. **Akute Hilfe** — `ACUTE_HELP_RESOURCES` in `src/lib/constants.ts` ist leer.
   Notrufnummern und Krisendienste müssen von einem Menschen verifiziert
   werden; eine falsche Nummer auf dieser Seite wäre gefährlich. `/akute-hilfe`
   zeigt bis dahin bewusst allgemeine Hinweise (Notruf, Notaufnahme,
   Hausarztpraxis, Beratungsstellen) ohne erfundene Kontaktdaten.
2. **Impressum** — `src/app/impressum/page.tsx` enthält nur die Struktur. Die
   Pflichtangaben (Anbieter, Anschrift, Vertretung, Register, USt-IdNr.) müssen
   mit echten Unternehmensdaten gefüllt werden.
3. **Datenschutzerklärung** — `src/app/datenschutz/page.tsx` beschreibt
   faktisch korrekt, was die Seite verarbeitet. Die vollständige, rechtlich
   geprüfte Erklärung (Verantwortlicher, Rechtsgrundlagen, Speicherdauern,
   Auftragsverarbeiter, Hosting-Standort) fehlt noch.
4. **Social-URLs** — Platzhalter in `SOCIAL` (`src/lib/constants.ts`).
5. **Supabase- und PostHog-Zugangsdaten** sowie die echte Domain in
   `NEXT_PUBLIC_SITE_URL`.

Kein Punkt davon blockiert die Entwicklung, aber alle fünf müssen vor dem
öffentlichen Start erledigt sein.

---

## Bewusste inhaltliche Grenzen

Die Seite behauptet nichts, was nicht belegt ist: keine Testimonials, keine
Nutzerzahlen, keine Partnerlogos, keine Presse, keine klinischen Aussagen und
kein Startdatum. Falls Social Proof fehlt, steht dort lieber nichts.

Die Grenzen von Evi (keine Psychotherapie, keine Diagnose, kein Krisendienst)
stehen in einem eigenen, gut sichtbaren Abschnitt — nicht im Kleingedruckten.
