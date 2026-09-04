/**
 * Preflight for the inbox logo (BIMI).
 *
 * Answers one question: würde Gmail das Evi-Logo neben dem Absender zeigen?
 *
 *   npm run verify:bimi
 *   npm run verify:bimi -- evi-health.eu
 *
 * Reads nothing outside DNS and one HTTPS GET, writes nothing. Jeder Schritt
 * ist einzeln aussagekräftig — die DNS-Kette taugt auch ohne Zertifikat etwas,
 * weil sie die Zustellbarkeit trägt. Details und Reihenfolge:
 * docs/runbook-logo-in-mailclients.md
 */

import { readFile } from "node:fs/promises";
import { resolveTxt, resolveCname } from "node:dns/promises";

const DOMAIN = process.argv[2] ?? "evi-health.eu";
const LOCAL = new URL("../public/assets/evi-bimi.svg", import.meta.url);

const results = [];

function record(name, ok, detail) {
  results.push({ ok });
  console.log(`${ok ? "  ok  " : " FAIL "} ${name}`);
  if (detail) console.log(`        ${detail}`);
}

/** Nicht jede offene Stelle ist ein Fehler — manches ist schlicht der nächste Schritt. */
function pending(name, detail) {
  console.log(`  --   ${name}`);
  if (detail) console.log(`        ${detail}`);
}

async function txt(name) {
  try {
    return (await resolveTxt(name)).map((parts) => parts.join(""));
  } catch {
    return [];
  }
}

console.log(`\nPosteingang-Logo — Preflight für ${DOMAIN}\n`);

// ---------------------------------------------------------------- 1. Datei
console.log("Logodatei (SVG Tiny Portable/Secure)");

let svg = null;
try {
  svg = await readFile(LOCAL, "utf8");
} catch {
  record("public/assets/evi-bimi.svg vorhanden", false, "Datei fehlt.");
}

if (svg !== null) {
  const bytes = Buffer.byteLength(svg);
  record("Datei vorhanden", true, `${bytes} Byte`);
  record("unter 32 KB", bytes < 32768, bytes >= 32768 ? `${bytes} Byte` : undefined);
  record('baseProfile="tiny-ps"', /baseProfile="tiny-ps"/.test(svg));
  record('version="1.2"', /version="1\.2"/.test(svg));
  record(
    "<title> als erstes Kindelement, nicht leer",
    /<svg[^>]*>\s*<title>[^<\s][^<]*<\/title>/.test(svg),
  );

  const box = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  record(
    "viewBox quadratisch",
    Boolean(box) && box[1] === box[2],
    box ? `viewBox="0 0 ${box[1]} ${box[2]}"` : "kein viewBox",
  );
  record("kein x/y am Wurzelelement", !/<svg[^>]*\s(?:x|y)=/.test(svg));

  // Was SVG Tiny P/S ausschließt. Ein Illustrator-Export bringt fast immer
  // <style> oder <image> mit und wird dann vom Aussteller abgelehnt.
  const banned = ["script", "a", "image", "foreignObject", "style", "use", "switch", "text", "animate", "filter"];
  const found = banned.filter((t) => new RegExp(`<${t}[\\s/>]`).test(svg));
  record("keine verbotenen Elemente", found.length === 0, found.length ? `gefunden: <${found.join(">, <")}>` : undefined);
  record("kein DOCTYPE", !/<!DOCTYPE/i.test(svg));
  record("kein CSS", !/class=|<style/.test(svg));

  const external = svg.match(/(?:href|xlink:href|src)="(?!#)[^"]*"/g) ?? [];
  record("keine externen Verweise", external.length === 0, external.join(", ") || undefined);
}

// ---------------------------------------------------------------- 2. DMARC
console.log("\nDMARC — ohne Durchsetzung ignoriert jeder Client BIMI");

let cname = null;
try {
  cname = (await resolveCname(`_dmarc.${DOMAIN}`))[0] ?? null;
} catch {
  // Kein CNAME ist der Normalfall.
}
record(
  "_dmarc ist ein eigener TXT-Eintrag",
  cname === null,
  cname ? `zeigt als CNAME auf ${cname} — fremdverwaltet, siehe Runbook Schritt 1` : undefined,
);

const dmarc = (await txt(`_dmarc.${DOMAIN}`)).find((v) => /^v=DMARC1/i.test(v));
record("DMARC-Eintrag vorhanden", Boolean(dmarc), dmarc);

if (dmarc) {
  const policy = dmarc.match(/\bp\s*=\s*(none|quarantine|reject)/i)?.[1]?.toLowerCase();
  record(
    "Policy ist quarantine oder reject",
    policy === "quarantine" || policy === "reject",
    policy === "none" ? "p=none — BIMI wird ignoriert, egal wie der Rest steht" : `p=${policy ?? "fehlt"}`,
  );

  // pct fehlt = 100. Ein kleinerer Wert ist beim DMARC-Rollout üblich, macht
  // BIMI aber ungültig.
  const pct = dmarc.match(/\bpct\s*=\s*(\d+)/i)?.[1];
  record("pct ist 100", pct === undefined || pct === "100", pct ? `pct=${pct}` : "nicht gesetzt (= 100)");

  const rua = /\brua\s*=\s*mailto:/i.test(dmarc);
  if (rua) record("Berichtsadresse (rua) gesetzt", true);
  else pending("Berichtsadresse (rua) gesetzt", "Ohne rua= ist jede Verschärfung ein Blindflug.");
}

// ------------------------------------------------------- 3. SPF/DKIM-Basis
console.log("\nAusrichtung — was DMARC überhaupt bestehen lässt");

const spf = (await txt(DOMAIN)).find((v) => /^v=spf1/i.test(v));
record("SPF vorhanden", Boolean(spf), spf);

const dkim = await txt(`resend._domainkey.${DOMAIN}`);
record(
  "DKIM-Schlüssel für Resend auf der Absenderdomain",
  dkim.length > 0,
  dkim.length ? "gesetzt — Resend besteht DMARC über DKIM" : "fehlt: Mail über Resend besteht DMARC nicht",
);

// ----------------------------------------------------------------- 4. BIMI
console.log("\nBIMI-Eintrag");

const bimi = (await txt(`default._bimi.${DOMAIN}`)).find((v) => /^v=BIMI1/i.test(v));
if (!bimi) {
  pending("default._bimi gesetzt", "Noch nicht angelegt — erst sinnvoll, wenn DMARC oben scharf steht.");
} else {
  record("default._bimi gesetzt", true, bimi);

  const logo = bimi.match(/\bl\s*=\s*([^;]+)/i)?.[1]?.trim();
  record("l= zeigt auf ein HTTPS-SVG", Boolean(logo?.startsWith("https://")), logo);

  const pem = bimi.match(/\ba\s*=\s*([^;]*)/i)?.[1]?.trim();
  if (pem === undefined) pending("a= (Zertifikat)", "Nicht gesetzt — Gmail, Yahoo und Apple Mail zeigen dann nichts.");
  else record("a= ist nicht leer", pem.length > 0, pem || "leer gesetzt — weglassen statt leer lassen");

  // 5. Die verlinkte Datei muss ohne Umweg erreichbar sein und mit dem
  //    Repo-Stand übereinstimmen — der Aussteller prüft gegen genau diese URL.
  if (logo?.startsWith("https://")) {
    console.log("\nAusgelieferte Datei");
    try {
      const response = await fetch(logo, { redirect: "manual" });
      record("HTTP 200 ohne Weiterleitung", response.status === 200, `HTTP ${response.status}`);
      const type = response.headers.get("content-type") ?? "";
      record("Content-Type image/svg+xml", type.includes("image/svg+xml"), type || "keiner");
      if (response.status === 200 && svg !== null) {
        const served = await response.text();
        record("identisch mit der Datei im Repo", served.trim() === svg.trim(), served.trim() === svg.trim() ? undefined : "Deploy steht aus oder die Datei wurde ersetzt.");
      }
    } catch (error) {
      record("erreichbar", false, `${error.message ?? error}`);
    }
  }
}

console.log();
const failed = results.filter((r) => !r.ok).length;
if (failed === 0) {
  console.log("Alles grün. Was hier nicht geprüft werden kann: ob Gmail das Logo\nbereits übernommen hat — das braucht Versandhistorie.\n");
  process.exit(0);
}
console.log(`${failed} Prüfung${failed === 1 ? "" : "en"} fehlgeschlagen. docs/runbook-logo-in-mailclients.md\n`);
process.exit(1);
