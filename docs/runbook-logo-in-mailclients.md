# Runbook: Evi-Logo im Posteingang (BIMI)

Ziel: Wer eine Mail von Evi bekommt, sieht neben dem Absender das Maskottchen
statt des grauen „E"-Kreises.

**Das ist nicht dasselbe wie das Logo im Mailtext.** Drei verschiedene Dinge, die
oft verwechselt werden:

| | Wo | Stand heute |
| --- | --- | --- |
| **A — Avatar im Posteingang** | Kreis links neben dem Absender, schon in der Listenansicht | fehlt — darum geht es hier |
| **B — Logo im Mailtext** | oben in der Mail | in „Du bist auf der Liste" und der Erinnerung vorhanden, in der **Bestätigungsmail bewusst nicht** (siehe unten) |
| **C — Blauer Haken** | neben dem Absendernamen in Gmail | fehlt, setzt A mit registrierter Marke voraus |

Für A gibt es genau einen offiziellen Weg: **BIMI**. Und einen kostenlosen
Behelf, der nur in Gmail wirkt.

---

## Ausgangslage (gemessen am 2026-09-04)

```
evi-health.eu           TXT    v=spf1 include:_spf-eu.ionos.com ~all
_dmarc.evi-health.eu    CNAME  dmarc.ionos.de  ->  "v=DMARC1; p=none;"
resend._domainkey.evi-health.eu   TXT  (DKIM, gesetzt)
default._bimi.evi-health.eu       —    nicht vorhanden
Nameserver              ns1024.ui-dns.de u. a. (IONOS)
```

Absender ist `Evi <hello@evi-health.eu>`, also die **Hauptdomain**. Damit ist die
Hauptdomain gleichzeitig die Organisationsdomain — das vereinfacht BIMI, weil
nur eine Domain scharf gestellt werden muss.

Zwei Dinge, die man dabei wissen muss:

1. **SPF deckt Resend nicht ab.** Im SPF steht nur IONOS. Der Versand über Resend
   besteht DMARC ausschließlich über **DKIM**. Das reicht — DMARC verlangt nur
   einen ausgerichteten Mechanismus, und der DKIM-Schlüssel liegt unter
   `evi-health.eu`, ist also ausgerichtet. Aber es heißt: Fällt DKIM aus, fällt
   die Zustellung mit aus, sobald die Policy scharf steht.
2. **Der DMARC-Eintrag gehört gerade IONOS.** `_dmarc` ist ein CNAME auf einen
   von IONOS verwalteten Sammel-Eintrag mit `p=none` und **ohne `rua=`**. Es
   kommen also keine DMARC-Berichte an. Ohne Berichte ist jede Verschärfung ein
   Blindflug.

---

## Der ehrliche Teil: was BIMI kostet

BIMI selbst ist gratis — zwei DNS-Einträge. Aber:

**Gmail zeigt ein BIMI-Logo nur mit Zertifikat.** Entweder ein **VMC**
(Verified Mark Certificate, verlangt eine **eingetragene Marke**) oder ein **CMC**
(Common Mark Certificate, verlangt **12 Monate nachweisliche Nutzung** des Logos).
Yahoo und Apple Mail ebenso. Marktpreise 2026: grob **650–1.750 $ pro Jahr**,
Listenpreis bei DigiCert rund 1.400 $. Ohne Zertifikat bleibt in Gmail der graue
Kreis, egal wie sauber DNS ist.

Ohne Zertifikat zeigen BIMI trotzdem an: Fastmail, Zone.eu, La Poste. Für eine
deutsche Campus-Zielgruppe ist das praktisch niemand.

**Empfehlung:** Schritte 1–3 jetzt machen (kostenlos, ohnehin richtig, verbessert
die Zustellbarkeit unabhängig von BIMI). Schritt 4 erst, wenn eine Marke
eingetragen ist oder das Logo 12 Monate nachweisbar läuft. Bis dahin Schritt 0
als Behelf.

---

## Schritt 0 — Kostenloser Behelf, wirkt nur in Gmail

Gmail zeigt als Absenderbild das Profilfoto des Google-Kontos, das zu der
Absenderadresse gehört. Ein Google-Konto lässt sich mit einer beliebigen Adresse
anlegen, auch mit einer IONOS-Adresse.

1. `hello@evi-health.eu` muss als Postfach oder Weiterleitung bei IONOS
   tatsächlich existieren — steht laut `status-2026-09-04-produktion.md` noch aus.
2. <https://accounts.google.com/signup> → **„Stattdessen vorhandene E-Mail-Adresse
   verwenden"** → `hello@evi-health.eu`, Bestätigungscode aus dem Postfach.
3. Im Google-Konto unter **Persönliche Daten → Profilfoto**
   `public/assets/logo-mascot.png` hochladen, quadratisch zuschneiden.

Wirkt nur bei Gmail-Empfängern, ist kein Markensignal und kein Ersatz für BIMI.
Aber es ist in einer halben Stunde erledigt und kostet nichts.

---

## Schritt 1 — DMARC von IONOS übernehmen und Berichte einschalten

IONOS: **Domains & SSL** → Domain → **DNS**.

1. Den **CNAME** `_dmarc` → `dmarc.ionos.de` **löschen**. Solange er steht, kann
   kein eigener TXT-Eintrag daneben existieren.
2. Neu anlegen:

   | Typ | Hostname | Wert | TTL |
   | --- | --- | --- | --- |
   | `TXT` | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@evi-health.eu; fo=1` | 1 Stunde |

`p=none` ändert am Verhalten nichts — es wird weiterhin nichts abgewiesen. Neu
ist nur `rua=`: ab jetzt schicken Google, Microsoft und Co. täglich
XML-Berichte, wer unter `evi-health.eu` versendet und ob es ausgerichtet ist.

`dmarc@evi-health.eu` muss ein echtes Postfach oder eine Weiterleitung sein. Die
Berichte sind gezippte XML-Dateien; ein kostenloser Auswerter wie
dmarcian oder Postmark DMARC macht sie lesbar.

**Prüfen:**

```bash
dig +short TXT _dmarc.evi-health.eu
# erwartet: "v=DMARC1; p=none; rua=mailto:dmarc@evi-health.eu; fo=1"
```

---

## Schritt 2 — Zwei Wochen mitlesen

Nicht überspringen. Gesucht wird genau eine Antwort: **Gibt es Mail unter
`evi-health.eu`, die DMARC nicht besteht?**

Kandidaten, die erfahrungsgemäß auftauchen:

- das IONOS-Postfach selbst (sollte über SPF passen),
- Resend (passt über DKIM),
- vergessene Formulare, Newsletter-Tools, Kalendereinladungen.

Erst wenn zwei Wochen lang **alle** legitimen Quellen bestehen, weiter.

---

## Schritt 3 — Policy scharf stellen

BIMI verlangt `p=quarantine` oder `p=reject`, und `pct` muss auf 100 stehen
(Standard, wenn nicht angegeben). `p=none` wird ignoriert — der Eintrag hätte
keinerlei Wirkung.

In zwei Etappen, jeweils den `_dmarc`-TXT ersetzen:

| Etappe | Wert | Dauer |
| --- | --- | --- |
| 1 | `v=DMARC1; p=quarantine; rua=mailto:dmarc@evi-health.eu; fo=1` | 2 Wochen beobachten |
| 2 | `v=DMARC1; p=reject; rua=mailto:dmarc@evi-health.eu; fo=1` | Endzustand |

Für BIMI genügt bereits Etappe 1. `p=reject` ist der sauberere Endzustand, aber
kein Muss.

> **Nicht `pct=` kleiner 100 setzen.** Das ist ein verbreiteter Zwischenschritt
> beim DMARC-Rollout — BIMI wird dadurch aber ungültig.

---

## Schritt 4 — Logo und BIMI-Eintrag

### 4a. Die Logodatei

Liegt fertig im Repo: `public/assets/evi-bimi.svg` → nach dem nächsten Deploy
erreichbar unter

```
https://www.evi-health.eu/assets/evi-bimi.svg
```

Das ist **kein normales SVG**. BIMI verlangt das Profil *SVG Tiny Portable/Secure*:
quadratisches `viewBox`, `baseProfile="tiny-ps"`, ein nicht-leeres `<title>`,
keine Skripte, keine externen Verweise, keine eingebetteten Rasterbilder, kein
CSS, unter 32 KB. Die Datei erfüllt das (3,7 KB) und ist aus
`public/assets/logo-mascot.png` nachgezeichnet — Kontur mit 0,19 % Abweichung,
Verlauf, Herz und Augenringe aus derselben Datei gemessen.

Hintergrund ist deckendes Weiß statt transparent: Gmail beschneidet das Bild zu
einem Kreis, und transparente BIMI-Logos landen je nach Client auf
unterschiedlichem Grund — im Dark Mode auch auf Schwarz, wo die dunklen Pupillen
verschwinden würden.

Nach dem Deploy prüfen — es darf **keine Weiterleitung** dazwischen sein:

```bash
curl -sSI https://www.evi-health.eu/assets/evi-bimi.svg | head -3
# erwartet: HTTP/2 200 und content-type: image/svg+xml
```

Danach durch <https://bimigroup.org/bimi-generator/> schicken.

### 4b. Das Zertifikat

Aussteller laut BIMI Group: DigiCert, GlobalSign, SSL.com. Verlangt wird eine
Firmenprüfung plus Markennachweis; das Logo im Zertifikat muss **pixelgleich**
zu dem unter `l=` sein. Rechne mit 2–4 Wochen.

### 4c. Der DNS-Eintrag

| Typ | Hostname | Wert |
| --- | --- | --- |
| `TXT` | `default._bimi` | `v=BIMI1; l=https://www.evi-health.eu/assets/evi-bimi.svg; a=https://www.evi-health.eu/assets/evi-vmc.pem` |

Ohne Zertifikat das `a=` **ganz weglassen**, nicht leer lassen.

**Prüfen:**

```bash
dig +short TXT default._bimi.evi-health.eu
```

Gmail übernimmt das nicht sofort — es braucht Versandhistorie und eine
unauffällige Reputation. Rechne mit Tagen bis Wochen.

---

## Entschieden: Logo auch in der Bestätigungsmail

Bis zum 2026-09-04 enthielt `src/lib/mail/templates/confirm-waitlist.ts`
**absichtlich kein Bild** — die erste Mail, die jemand von Evi sieht, sollte
nichts nachladen, bevor er irgendetwas bestätigt hat.

Das ist jetzt umgedreht: Alle drei Mails zeigen oben dasselbe Logo. Der Preis
ist real und benannt — ein nachgeladenes Bild verrät dem Server Zeitpunkt und
IP-Adresse des Öffnens. Abgesichert ist es so:

- **Eine** Bilddatei, von der eigenen Domain, für **alle** Empfänger dieselbe
  URL. Kein Token, kein Parameter, keine Zuordnung zu einer Anmeldung möglich.
- `alt=""` — das Logo ist dekorativ. Wer Bilder blockiert, verliert nichts.
- Öffnungen werden **nirgends gespeichert oder ausgewertet**.
- Die Datenschutzerklärung benennt es im Abschnitt „Bestätigung deiner
  Anmeldung", inklusive der IP-Adresse.

> **Grenze:** ein zweites Bild oder eine empfängerspezifische Bild-URL macht
> daraus ein Zählpixel. Der Kommentar im Template hält das fest — beim nächsten
> Umbau nicht wegkürzen.

## Was schiefgehen kann

**BIMI-Eintrag steht, Gmail zeigt nichts.** Häufigste Ursache: `p=none`. Zweit-
häufigste: kein Zertifikat. Drittens: zu wenig Versandvolumen — Gmail zeigt BIMI
erst bei etablierten Absendern.

**IONOS lehnt den `_dmarc`-Eintrag ab.** Meist steht der CNAME noch daneben. Ein
Hostname kann nicht gleichzeitig CNAME und TXT sein.

**Mail landet nach `p=quarantine` im Spam.** Dann versendet eine Quelle
unausgerichtet. Policy sofort auf `p=none` zurück, Berichte lesen, Ursache
beheben. Genau deshalb steht Schritt 2 vor Schritt 3.

**Das SVG wird abgelehnt.** Fast immer, weil ein Grafikprogramm beim Export
`<style>`, `<image>` oder eine nicht-quadratische `viewBox` einbaut. Die Datei im
Repo ist von Hand erzeugt und geprüft — nicht durch einen Illustrator-Export
ersetzen, ohne erneut zu validieren.
