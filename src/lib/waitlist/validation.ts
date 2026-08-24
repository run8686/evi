/**
 * Waitlist input validation.
 *
 * Runs on the server, on every submission. The browser's `type="email"` and
 * `required` attributes are a convenience for the person filling in the form,
 * not a guarantee — a Server Action is reachable by direct POST.
 */

/** RFC-length ceilings. */
const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_LENGTH = 64;
const MAX_FIRST_NAME_LENGTH = 80;

/**
 * Pragmatic e-mail shape check: a local part, an @, then at least one dotted
 * domain label and an alphabetic TLD. This intentionally does not attempt full
 * RFC 5322 — the authoritative test of an address is whether mail to it
 * arrives, and over-strict patterns reject valid addresses.
 */
const EMAIL_PATTERN =
  /^[^\s@,;:<>()[\]\\"]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;

export type EmailValidation =
  | { ok: true; email: string }
  | { ok: false; reason: "missing" | "too_long" | "invalid" };

export function validateEmail(raw: unknown): EmailValidation {
  if (typeof raw !== "string") return { ok: false, reason: "missing" };

  const email = raw.trim().toLowerCase();
  if (!email) return { ok: false, reason: "missing" };
  if (email.length > MAX_EMAIL_LENGTH) return { ok: false, reason: "too_long" };

  const [local, ...domainParts] = email.split("@");
  if (domainParts.length !== 1) return { ok: false, reason: "invalid" };
  if (!local || local.length > MAX_LOCAL_LENGTH) {
    return { ok: false, reason: "invalid" };
  }
  // A dot may separate local-part atoms but cannot lead, trail or repeat.
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
    return { ok: false, reason: "invalid" };
  }
  if (!EMAIL_PATTERN.test(email)) return { ok: false, reason: "invalid" };

  return { ok: true, email };
}

/**
 * First name is optional and only used to address people by name in the
 * invitation mail. Empty or whitespace-only becomes null rather than "".
 */
export function normalizeFirstName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  // Collapse internal whitespace so "  Anna   M " becomes "Anna M".
  const name = raw.trim().replace(/\s+/g, " ");
  if (!name) return null;
  return name.slice(0, MAX_FIRST_NAME_LENGTH);
}

/** Attribution values arrive from the client, so cap them before storing. */
export function normalizeAttributionValue(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;
  return value.slice(0, 200);
}
