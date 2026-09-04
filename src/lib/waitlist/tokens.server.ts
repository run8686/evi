import "server-only";

import { createHash, createHmac, randomBytes } from "node:crypto";

/**
 * Confirmation and unsubscribe tokens.
 *
 * The raw token only ever exists in the link inside the mail. The database
 * stores its SHA-256 hash, so reading the table gives nobody a working
 * confirmation link — which matters, because that link is what turns an
 * address someone typed into a consent record.
 */

/** 32 random bytes. Guessing one is not a threat model, it is arithmetic. */
export function createToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Hex SHA-256, which is also the shape the database enforces
 * (`^[0-9a-f]{64}$`, see migration 0003). No salt: the input is already
 * high-entropy random, so a salt would add storage and nothing else.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/**
 * The unsubscribe token for an address.
 *
 * Derived rather than random, and that is the whole point: an unsubscribe link
 * printed in a mail sent weeks ago has to keep working. A random token would
 * have to be re-issued on every resend, which would silently break the link in
 * every earlier mail — and an unsubscribe link that answers "you are not on
 * the list" to someone who is, is worse than none.
 *
 * The secret never leaves the server, so the database — which holds only the
 * hash — gives nobody the ability to forge one. Rotating the secret
 * invalidates every unsubscribe link ever sent, so it is not rotated casually.
 */
export function unsubscribeTokenFor(email: string): string {
  const secret = process.env.WAITLIST_TOKEN_SECRET;
  if (!secret) {
    throw new Error("WAITLIST_TOKEN_SECRET is not set");
  }
  return createHmac("sha256", secret)
    .update(email.trim().toLowerCase(), "utf8")
    .digest("base64url");
}

export function isTokenSecretConfigured(): boolean {
  return Boolean(process.env.WAITLIST_TOKEN_SECRET);
}
