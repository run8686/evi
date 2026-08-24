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

> `npm run typecheck` braucht einmalig einen `npm run build`, weil Next.js die
> Routen-Typen (`LayoutProps`, `PageProps`) generiert.

---

## Umgebungsvariablen

Siehe `.env.example`. Kurz:

| Variable                  | Pflicht | Zweck                                          |
| ------------------------- | ------- | ---------------------------------------------- |
| `SUPABASE_URL`            | ja      | Supabase-Projekt-URL (nur serverseitig)        |
| `SUPABASE_ANON_KEY`       | ja      | Anon-Key, per RLS auf INSERT beschränkt        |
| `NEXT_PUBLIC_POSTHOG_KEY` | nein    | Ohne Key wird keine Statistik geladen          |
| `NEXT_PUBLIC_POSTHOG_HOST`| nein    | Standard: `https://eu.i.posthog.com`           |
| `NEXT_PUBLIC_SITE_URL`    | s. u.   | Basis-URL für Canonical, Open Graph, Sitemap   |

### Wie die Site-URL bestimmt wird

Es ist **keine Domain fest im Code hinterlegt**. `src/lib/constants.ts` löst der
Reihe nach auf:

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

`supabase/migrations/0001_create_waitlist_signups.sql` im Supabase-SQL-Editor
ausführen (oder via Supabase CLI). Die Migration legt an:

- Tabelle `waitlist_signups`
- Unique-Index auf `lower(email)` — doppelte Anmeldung ist kein Fehler
- RLS aktiv, **nur** eine INSERT-Policy für `anon`

Es gibt absichtlich **keine** SELECT-Policy: Selbst mit dem öffentlichen Key
lässt sich die Warteliste nicht auslesen. Zum Lesen das Supabase-Dashboard
verwenden.

Gespeichert werden ausschließlich: E-Mail, optionaler Vorname, Zeitstempel,
Locale, UTM-Parameter, Referrer und der optionale Marketing-Consent.
**Keine Gesundheitsdaten** — das Formular fragt nichts dazu, und die Tabelle
hat keine Spalte dafür. Das soll so bleiben.

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

- `public/assets/logo-mascot.png` — Maskottchen, **unveränderte** Originalfarben
  (Verlauf gelb `#FFD105` → rosé `#FF5366`, periwinkle Herz `#466EFA`)
- `public/assets/wordmark-black.png` / `wordmark-white.png` — identische
  Buchstabenformen, nur die Füllung unterscheidet sich
- `src/app/icon.png`, `src/app/apple-icon.png` — Favicon / Touch-Icon

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
