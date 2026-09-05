import "server-only";

/**
 * Best-effort per-IP rate limit for the chat endpoint.
 *
 * In-memory only — no new infrastructure for this. A serverless instance is
 * ephemeral and traffic can land on any of several, so this does not bound
 * abuse from a determined attacker with many IPs. It does stop the common
 * case (one browser tab firing requests in a loop) without adding Redis or
 * any other durable store for a landing-page widget. If real abuse shows up,
 * a shared store is the next step — not before.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

const hits = new Map<string, number[]>();

/** Bounds the map itself so a flood of distinct IPs can't grow it forever. */
const MAX_TRACKED_KEYS = 5000;

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const timestamps = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    hits.set(key, timestamps);
    return true;
  }

  timestamps.push(now);

  if (hits.size >= MAX_TRACKED_KEYS && !hits.has(key)) {
    // Drop the oldest-inserted key rather than let the map grow unbounded.
    const oldestKey = hits.keys().next().value;
    if (oldestKey !== undefined) hits.delete(oldestKey);
  }

  hits.set(key, timestamps);
  return false;
}

/** Best-effort client identity from standard proxy headers, IP if nothing else. */
export function clientKeyFromHeaders(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
