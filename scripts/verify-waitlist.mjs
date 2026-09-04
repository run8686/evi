/**
 * Preflight for the Early Access waitlist.
 *
 * Answers one question before the page is advertised anywhere: would a real
 * signup actually be stored and confirmable? The landing page fails loudly
 * when it is misconfigured, but only in the browser, and only after someone
 * has already tried to sign up. This checks the same wiring from the terminal.
 *
 *   npm run verify:waitlist
 *
 * Reads the environment from .env.local. To check the deployed configuration
 * rather than a local one, pull it first:
 *
 *   npx vercel env pull .env.local
 *
 * Writes nothing. Every probe deliberately violates a rule the database
 * enforces, so no row is ever created — the point is to learn *which* rule
 * rejected it. A probe that succeeds means the database is not enforcing what
 * it should, and is reported as a failure.
 *
 * The schema is checked in whichever state it is in: migrations 0001+0002
 * (signup stored directly, no confirmation mail), 0003 (double opt-in, and
 * the anon key has no direct table access at all), or 0005 (final receipt after
 * a successful confirmation), or 0006 (one cancellable reminder after 24h).
 */

import { createClient } from "@supabase/supabase-js";

const TABLE = "waitlist_signups";

/** Postgres: CHECK constraint violated. */
const CHECK_VIOLATION = "23514";
/** Postgres: row-level security policy violated, or privilege missing. */
const DENIED = "42501";
/** PostgREST: column missing from the schema cache. */
const UNKNOWN_COLUMN = "PGRST204";
/** PostgREST: table missing from the schema cache. */
const UNKNOWN_TABLE = "PGRST205";
/** PostgREST: function missing from the schema cache. */
const UNKNOWN_FUNCTION = "PGRST202";

/** A hash-shaped value that belongs to no row. */
const NOWHERE_TOKEN = "0".repeat(64);

const results = [];

function record(name, ok, detail) {
  results.push({ ok });
  console.log(`${ok ? "  ok  " : " FAIL "} ${name}`);
  if (detail) console.log(`        ${detail}`);
}

/**
 * A transport failure, not a database answer.
 *
 * supabase-js does not throw when the host cannot be reached — it returns the
 * failure in the same shape as a real database error, with no code. Treating
 * that as a database answer is how a preflight reports green on a broken
 * connection, so it is classified explicitly.
 */
function isTransportFailure(error) {
  if (!error || error.code) return false;
  return /fetch failed|network|ENOTFOUND|ECONNREFUSED|timeout/i.test(
    `${error.message ?? ""}`,
  );
}

/** A host that is not Supabase answers with whole HTML pages. Keep it short. */
function describe(error) {
  const message = `${error.message ?? "unbekannt"}`
    .replace(/\s+/g, " ")
    .slice(0, 160);
  return error.code ? `${error.code}: ${message}` : message;
}

function bail(message) {
  console.log(`\n${message}\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

console.log("\nWarteliste — Preflight\n");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  record(
    "Supabase konfiguriert",
    false,
    `SUPABASE_URL ${url ? "gesetzt" : "FEHLT"}, SUPABASE_ANON_KEY ${key ? "gesetzt" : "FEHLT"}. ` +
      "Ohne beide lehnt das Formular jede Anmeldung ab.",
  );
  bail("Abgebrochen: ohne Datenbank ist nichts zu prüfen.");
}
record("Supabase konfiguriert", true, new URL(url).host);

const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------------------------------------------------------------------------
// Which migration state is this?
// ---------------------------------------------------------------------------

const stageProbe = await client.rpc("waitlist_confirm", {
  p_token_hash: NOWHERE_TOKEN,
});

if (isTransportFailure(stageProbe.error)) {
  record(
    "Erreichbarkeit",
    false,
    `Host nicht erreichbar (${stageProbe.error.message}).`,
  );
  bail("Abgebrochen: ohne Verbindung sagen die weiteren Prüfungen nichts aus.");
}

const hasDoubleOptIn = stageProbe.error?.code !== UNKNOWN_FUNCTION;

if (hasDoubleOptIn) {
  if (stageProbe.error) {
    record(
      "Migration 0003 — Bestätigungs-Funktion",
      false,
      describe(stageProbe.error),
    );
  } else if (stageProbe.data === "invalid") {
    record(
      "Migration 0003 — Bestätigungs-Funktion",
      true,
      "antwortet auf unbekannte Token",
    );
  } else {
    record(
      "Migration 0003 — Bestätigungs-Funktion",
      false,
      `Unerwartete Antwort auf einen Token, den es nicht gibt: ${stageProbe.data}`,
    );
  }

  // Signing up must go through the function, and the function must refuse a
  // malformed address before writing anything.
  const signup = await client.rpc(
    "waitlist_request_confirmation_with_reminder",
    {
      p_email: "x",
      p_first_name: null,
      p_locale: "de-DE",
      p_utm_source: null,
      p_utm_medium: null,
      p_utm_campaign: null,
      p_utm_content: null,
      p_utm_term: null,
      p_referrer: null,
      p_marketing_consent: false,
      p_confirmation_token_hash: NOWHERE_TOKEN,
      p_unsubscribe_token_hash: NOWHERE_TOKEN,
    },
  );

  if (signup.error?.code === CHECK_VIOLATION) {
    record(
      "Migration 0006 — Anmeldung mit Erinnerung",
      true,
      "erreichbar, Constraints greifen",
    );
  } else if (signup.error?.code === UNKNOWN_FUNCTION) {
    record(
      "Migration 0006 — Anmeldung mit Erinnerung",
      false,
      "waitlist_request_confirmation_with_reminder fehlt. Die 24-Stunden-Erinnerung ist nicht aktiv.",
    );
  } else if (!signup.error) {
    record(
      "Migration 0006 — Anmeldung mit Erinnerung",
      false,
      "Eine ungültige Adresse wurde ANGENOMMEN. Die Constraints aus Migration 0001 fehlen.",
    );
  } else {
    record(
      "Migration 0006 — Anmeldung mit Erinnerung",
      false,
      describe(signup.error),
    );
  }

  // The confirmation path used by the deployed app must expose at most the
  // scheduled reminder id associated with a valid token. A nowhere token
  // returns neither an address nor an id.
  const reminder = await client.rpc("waitlist_confirm_with_receipt_v2", {
    p_token_hash: NOWHERE_TOKEN,
  });
  const reminderRow = Array.isArray(reminder.data) ? reminder.data[0] : null;
  if (reminder.error?.code === UNKNOWN_FUNCTION) {
    record(
      "Migration 0006 — Erinnerungs-Storno",
      false,
      "waitlist_confirm_with_receipt_v2 fehlt. Bestätigte Personen könnten weiter erinnert werden.",
    );
  } else if (reminder.error) {
    record(
      "Migration 0006 — Erinnerungs-Storno",
      false,
      describe(reminder.error),
    );
  } else if (
    reminderRow?.result === "invalid" &&
    reminderRow?.recipient_email === null &&
    reminderRow?.should_send_receipt === false &&
    reminderRow?.reminder_email_id === null
  ) {
    record(
      "Migration 0006 — Erinnerungs-Storno",
      true,
      "unbekannte Token geben weder Adresse noch Resend-ID frei",
    );
  } else {
    record(
      "Migration 0006 — Erinnerungs-Storno",
      false,
      "Unerwartete Antwort auf einen Token, den es nicht gibt.",
    );
  }

  // Unsubscribing (migration 0004).
  const unsub = await client.rpc("waitlist_unsubscribe", {
    p_token_hash: NOWHERE_TOKEN,
  });
  if (unsub.error?.code === UNKNOWN_FUNCTION) {
    record(
      "Migration 0004 — Abmeldung",
      false,
      "waitlist_unsubscribe fehlt. Ohne sie führt der Abmeldelink in jeder Mail ins Leere.",
    );
  } else if (unsub.error) {
    record("Migration 0004 — Abmeldung", false, describe(unsub.error));
  } else if (unsub.data === "not_listed") {
    record(
      "Migration 0004 — Abmeldung",
      true,
      "antwortet auf unbekannte Token",
    );
  } else {
    record(
      "Migration 0004 — Abmeldung",
      false,
      `Unerwartete Antwort auf einen Token, den es nicht gibt: ${unsub.data}`,
    );
  }

  // The final transactional receipt (migration 0005). An unknown token must
  // not reveal an address and must not request a send.
  const receipt = await client.rpc("waitlist_confirm_with_receipt", {
    p_token_hash: NOWHERE_TOKEN,
  });
  const receiptRow = Array.isArray(receipt.data) ? receipt.data[0] : null;
  if (receipt.error?.code === UNKNOWN_FUNCTION) {
    record(
      "Migration 0005 — Aufnahmebestätigung",
      false,
      "waitlist_confirm_with_receipt fehlt. Nach der Bestätigung würde die finale Mail nicht versendet.",
    );
  } else if (receipt.error) {
    record(
      "Migration 0005 — Aufnahmebestätigung",
      false,
      describe(receipt.error),
    );
  } else if (
    receiptRow?.result === "invalid" &&
    receiptRow?.recipient_email === null &&
    receiptRow?.should_send_receipt === false
  ) {
    record(
      "Migration 0005 — Aufnahmebestätigung",
      true,
      "antwortet auf unbekannte Token ohne Adressfreigabe",
    );
  } else {
    record(
      "Migration 0005 — Aufnahmebestätigung",
      false,
      "Unerwartete Antwort auf einen Token, den es nicht gibt.",
    );
  }

  // After 0003 the anon key has no table privileges left at all.
  const direct = await client.from(TABLE).insert({ email: "x" });
  if (direct.error?.code === DENIED) {
    record(
      "Direkter Tabellenzugriff gesperrt",
      true,
      "anon darf nicht mehr direkt schreiben",
    );
  } else if (direct.error) {
    record(
      "Direkter Tabellenzugriff gesperrt",
      false,
      `Erwartet war eine Rechteverweigerung. ${describe(direct.error)}`,
    );
  } else {
    record(
      "Direkter Tabellenzugriff gesperrt",
      false,
      "Der öffentliche Key konnte direkt in die Tabelle schreiben und hat dabei eine Zeile angelegt.",
    );
  }
} else {
  // Migrations 0001 + 0002: the form still writes directly.
  record(
    "Migration 0003 — Double-Opt-In",
    true,
    "noch nicht eingespielt — die Warteliste sammelt ohne Bestätigungsmail",
  );

  const a = await client.from(TABLE).insert({ email: "x" });
  if (a.error?.code === CHECK_VIOLATION) {
    record(
      "Migration 0001 — Tabelle und Constraints",
      true,
      "erreichbar, Constraints greifen",
    );
  } else if (a.error?.code === UNKNOWN_TABLE) {
    record(
      "Migration 0001 — Tabelle und Constraints",
      false,
      `Tabelle "${TABLE}" existiert nicht. Migration 0001 im SQL-Editor ausführen.`,
    );
  } else if (a.error?.code === DENIED) {
    record(
      "Migration 0001 — Tabelle und Constraints",
      false,
      "Die INSERT-Policy für anon fehlt — echte Anmeldungen würden abgelehnt.",
    );
  } else if (!a.error) {
    record(
      "Migration 0001 — Tabelle und Constraints",
      false,
      "Eine ungültige Adresse wurde ANGENOMMEN, und es steht jetzt eine Schrott-Zeile in der Tabelle.",
    );
  } else {
    record(
      "Migration 0001 — Tabelle und Constraints",
      false,
      describe(a.error),
    );
  }

  const b = await client.from(TABLE).insert({ email: "x", status: "invited" });
  if (b.error?.code === DENIED) {
    record(
      "Migration 0002 — Status geschützt",
      true,
      "anon kann status nicht setzen",
    );
  } else if (b.error?.code === UNKNOWN_COLUMN) {
    record(
      "Migration 0002 — Status geschützt",
      false,
      "Spalte 'status' fehlt. Migration 0002 im SQL-Editor ausführen.",
    );
  } else if (!b.error) {
    record(
      "Migration 0002 — Status geschützt",
      false,
      "Eine Anmeldung konnte sich selbst als 'invited' eintragen.",
    );
  } else {
    record("Migration 0002 — Status geschützt", false, describe(b.error));
  }
}

// ---------------------------------------------------------------------------
// The property everything rests on
// ---------------------------------------------------------------------------

const read = await client.from(TABLE).select("email").limit(1);
if (isTransportFailure(read.error)) {
  record(
    "Warteliste nicht auslesbar",
    false,
    `Nicht prüfbar: ${read.error.message}`,
  );
} else if (read.error?.code) {
  record(
    "Warteliste nicht auslesbar",
    true,
    `Lesen abgewiesen (${read.error.code})`,
  );
} else if (read.error) {
  // An answer we cannot identify is not a denial.
  record(
    "Warteliste nicht auslesbar",
    false,
    `Nicht prüfbar: ${describe(read.error)}`,
  );
} else if (Array.isArray(read.data) && read.data.length === 0) {
  record("Warteliste nicht auslesbar", true, "Lesen liefert nichts zurück");
} else {
  record(
    "Warteliste nicht auslesbar",
    false,
    `Der öffentliche Key konnte ${read.data.length} Zeile(n) LESEN. Es gibt eine SELECT-Policy, die es nicht geben darf.`,
  );
}

// ---------------------------------------------------------------------------
// Mail
// ---------------------------------------------------------------------------

/**
 * `vercel env pull` does not write the value of a variable stored as Secret --
 * it writes the literal string "[SENSITIVE]". A truthiness check therefore
 * reports such a variable as configured when the value was never seen, which is
 * a green light for something this script did not actually verify.
 *
 * Production is unaffected: the real value is present at runtime. Only local
 * verification is blind, and it has to say so rather than guess.
 */
const SENSITIVE_PLACEHOLDER = "[SENSITIVE]";

function envState(name) {
  const raw = process.env[name];
  if (!raw) return { state: "missing" };
  if (raw === SENSITIVE_PLACEHOLDER) return { state: "hidden" };
  return { state: "present", value: raw };
}

const mailKeyState = envState("RESEND_API_KEY");
const mailFromState = envState("WAITLIST_MAIL_FROM");
const tokenSecretState = envState("WAITLIST_TOKEN_SECRET");

/** Missing is a failure. Hidden is honestly unknown, and must not read green. */
function recordEnv(label, state, presentDetail, missingDetail) {
  if (state.state === "present") {
    record(label, true, presentDetail(state.value));
  } else if (state.state === "hidden") {
    record(
      label,
      false,
      "In Vercel als Secret gespeichert — `vercel env pull` liefert dafür nur " +
        '"[SENSITIVE]". Lokal nicht prüfbar; in Produktion ist der Wert vorhanden. ' +
        "Für eine lokale Prüfung den Wert von Hand in .env.local eintragen.",
    );
  } else {
    record(label, false, missingDetail);
  }
}

const mailKey = mailKeyState.value;
const mailFrom = mailFromState.value;

if (hasDoubleOptIn) {
  // With 0003 in place a signup without mail is stored but unconfirmable.
  recordEnv(
    "Resend-Key prüfbar",
    mailKeyState,
    () => "gesetzt",
    "RESEND_API_KEY FEHLT. Mit Migration 0003 lehnt das Formular ohne den Wert jede Anmeldung ab.",
  );

  recordEnv(
    "Absender gesetzt",
    mailFromState,
    (value) =>
      /<[^>]+@[^>]+>/.test(value)
        ? `Absender: ${value}`
        : `Absender: ${value} — ohne Anzeigename. Empfänger sehen die nackte Adresse ` +
          `statt "Evi". Format: Evi <${value}>`,
    "WAITLIST_MAIL_FROM FEHLT.",
  );

  recordEnv(
    "Abmelde-Secret gesetzt",
    tokenSecretState,
    () => "Abmeldelinks sind ableitbar",
    "WAITLIST_TOKEN_SECRET FEHLT. Ohne den Wert lehnt das Formular jede Anmeldung ab, " +
      "weil kein Abmeldelink erzeugt werden kann. Erzeugen mit: openssl rand -base64 32",
  );
} else if (mailKey || mailFrom) {
  record(
    "Mailversand konfiguriert",
    true,
    "gesetzt, aber ohne Migration 0003 noch ungenutzt",
  );
}

const failed = results.filter((r) => !r.ok).length;
console.log();
if (failed === 0) {
  console.log("Alles grün. Eine echte Anmeldung würde gespeichert.\n");
  process.exit(0);
}
console.log(
  `${failed} Prüfung(en) fehlgeschlagen. Die Warteliste ist nicht bereit.\n`,
);
process.exit(1);
