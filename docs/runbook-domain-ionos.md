# Runbook: IONOS-Domain mit Vercel und Resend verbinden

Zwei getrennte Dinge, die dieselbe Domain benutzen:

| Zweck | Wohin | Was |
| --- | --- | --- |
| **Seite** | `<domain>` und `www.<domain>` → Vercel | A-Record + CNAME |
| **Mailversand** | `mail.<domain>` → Resend | MX + 2× TXT |

Sie stören sich nicht: Der Mailversand hängt an einer **Subdomain**, die Seite an
der Hauptdomain.

---

## Grundsatzentscheidung: DNS bleibt bei IONOS

Vercel bietet an, die Nameserver zu übernehmen. **Mach das nicht.** Vercels
eigene Doku warnt davor:

> „If you are verifying your domain by changing nameservers, you will need to add
> any DNS records to Vercel that you wish to keep from your previous DNS
> provider."

Bei IONOS sind das typischerweise die MX-Einträge für dein IONOS-Postfach. Die
wären nach einem Nameserver-Wechsel weg, und eingehende Mail an deine
Domain-Adresse käme nicht mehr an.

**Stattdessen:** DNS bleibt bei IONOS, du trägst dort einzelne Einträge nach.
Weniger Risiko, kein Postfach-Ausfall, jederzeit umkehrbar.

---

## Teil 1 — Domain in Vercel eintragen

1. <https://vercel.com/dashboard> → Projekt **evi-de** → **Settings** → **Domains**.
2. **Add Domain**, Domain eingeben (ohne `https://`, ohne `www`).
3. Vercel fragt, ob `www.<domain>` mitsoll → **ja**.
4. Vercel zeigt jetzt eine Karte mit den **exakten** Werten. Genau die brauchst du:

   | Für | Typ | Wert |
   | --- | --- | --- |
   | Hauptdomain (Apex) | `A` | die IP, die Vercel anzeigt |
   | `www` | `CNAME` | der Wert, den Vercel anzeigt |

   > **Nicht aus Anleitungen im Netz abschreiben.** Der CNAME ist pro Projekt
   > verschieden (Vercels Doku nennt als Beispiel
   > `d1d4fc829fe7bc7c.vercel-dns-017.com`), und der A-Record ist laut Vercel
   > „`76.76.21.21` **or your domain card's value**". Maßgeblich ist, was in
   > deinem Dashboard steht.

5. Beide Werte notieren, dann weiter zu Teil 2.

---

## Teil 2 — Einträge bei IONOS setzen

IONOS: **Domains & SSL** → auf die Domain klicken → Reiter **DNS**.

### 2a. Vorhandene Einträge prüfen

IONOS legt beim Kauf oft automatisch an:

- einen **A-Record** auf `@`, der auf eine IONOS-Parkseite zeigt
- ggf. einen **CNAME** auf `www`
- **MX-Einträge** für IONOS Mail

Den A-Record auf `@` und den CNAME auf `www` **bearbeitest du** (nicht neu
anlegen — sonst hast du zwei widersprüchliche Einträge und die Seite antwortet
mal so, mal so).

Die **MX-Einträge der Hauptdomain lässt du in Ruhe**, falls du das IONOS-Postfach
nutzt. Resend bekommt einen eigenen MX auf `mail`, das ist ein anderer Name und
kollidiert nicht.

### 2b. Seite

| Typ | Host/Name | Wert | TTL |
| --- | --- | --- | --- |
| `A` | `@` | *die IP aus Teil 1* | 1 Stunde |
| `CNAME` | `www` | *der Wert aus Teil 1* | 1 Stunde |

> Bei IONOS trägst du im Feld „Hostname" **nur den vorderen Teil** ein — also
> `www`, nicht `www.deinedomain.de`. IONOS hängt die Domain selbst an. Für die
> Hauptdomain ist das Feld leer oder `@`.

### 2c. Mailversand

Erst in Resend anlegen, damit du die echten Werte hast:

1. <https://resend.com> → **Domains** → **Add Domain**.
2. Als Domain **`mail.<deine-domain>`** eintragen, nicht die Hauptdomain.
   Resend empfiehlt das ausdrücklich: eine eigene Subdomain isoliert die
   Sende-Reputation. Wenn dort mal etwas schiefgeht, ist nicht die Zustellbarkeit
   deiner ganzen Domain betroffen.
3. Region **EU (Ireland)** wählen, falls angeboten.
4. Resend zeigt drei Einträge. Bei IONOS eintragen:

   | Typ | Host/Name bei IONOS | Wert |
   | --- | --- | --- |
   | `MX` | `mail` | *von Resend*, Priorität 10 |
   | `TXT` | `mail` | *SPF-Wert von Resend* (`v=spf1 …`) |
   | `TXT` | `resend._domainkey.mail` | *DKIM-Wert von Resend* (sehr lang) |

   > **Stolperfalle bei IONOS:** Der DKIM-Wert ist mehrere hundert Zeichen lang.
   > Füge ihn **ohne Zeilenumbrüche und ohne Anführungszeichen** ein. Wenn IONOS
   > den Eintrag ablehnt, liegt es fast immer an einem mitkopierten Zeilenumbruch.

5. Zusätzlich empfohlen (nicht von Resend verlangt, aber Gmail und Yahoo
   erwarten es seit 2024 von Absendern):

   | Typ | Host/Name | Wert |
   | --- | --- | --- |
   | `TXT` | `_dmarc.mail` | `v=DMARC1; p=none; rua=mailto:<deine-adresse>` |

   `p=none` heißt: nur beobachten, nichts abweisen. Das ist der richtige
   Startwert — schärfer stellen kann man später, wenn man sieht, dass alles
   sauber signiert ankommt.

6. In Resend auf **Verify** klicken. Dauert meist Minuten, laut IONOS bis zu
   24 Stunden.

---

## Teil 3 — Übergabe an Claude

Sag Bescheid, sobald:

- die Domain in Vercel als **Valid Configuration** angezeigt wird, und
- Resend die Domain als **Verified** führt.

Claude prüft dann per `dig` alle Einträge gegen, setzt `NEXT_PUBLIC_SITE_URL`,
`RESEND_API_KEY` und `WAITLIST_MAIL_FROM`, spielt Migration 0003 und 0004 ein und
fährt Deploy plus echten Mailtest.

Den **Resend-API-Key** legst du selbst an (Resend → **API Keys** → **Create**,
Berechtigung **Sending access** genügt) und trägst ihn selbst ein:

```bash
cd "/Users/Run/Documents/evi-landingpage"
npx vercel env add RESEND_API_KEY production --type config
```

---

## Was schiefgehen kann

**„Invalid Configuration" in Vercel.** Meist steht der alte IONOS-Parkseiten-A-Record
noch daneben. Es darf für `@` nur **einen** A-Record geben.

**Seite lädt, aber Zertifikat-Warnung.** Vercel stellt das Zertifikat erst nach
erfolgreicher DNS-Prüfung aus. Abwarten, nicht neu anlegen.

**Resend bleibt auf „Pending".** Fast immer der DKIM-TXT-Eintrag: falscher
Hostname (`resend._domainkey.mail`, nicht `resend._domainkey`) oder ein
Zeilenumbruch im Wert.

**Mail kommt an, landet aber im Spam.** DMARC-Eintrag fehlt, oder der Absender in
`WAITLIST_MAIL_FROM` gehört nicht zur verifizierten Subdomain. Der Absender muss
`…@mail.<domain>` lauten, nicht `…@<domain>`.
