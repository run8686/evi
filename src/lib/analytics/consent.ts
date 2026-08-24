/**
 * Analytics consent, modelled as an external store.
 *
 * Analytics is opt-in: PostHog is not loaded and no event is sent until the
 * visitor actively accepts. Declining is a real choice that is remembered, and
 * the page works identically either way.
 *
 * This lives in localStorage rather than React state so it survives reloads,
 * and is exposed through subscribe/getSnapshot so components can read it with
 * useSyncExternalStore without a hydration mismatch.
 */

const STORAGE_KEY = "evi.analytics-consent";

export type ConsentState = "granted" | "denied" | "unknown";

const listeners = new Set<() => void>();

/**
 * Cached so getSnapshot returns a stable value — useSyncExternalStore compares
 * snapshots by identity and would re-render forever otherwise.
 */
let snapshot: ConsentState | null = null;

function readStored(): ConsentState {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === "granted" || value === "denied") return value;
    return "unknown";
  } catch {
    // Storage can be blocked entirely; treat that as "not asked yet".
    return "unknown";
  }
}

export function subscribeConsent(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function getConsentSnapshot(): ConsentState {
  if (snapshot === null) snapshot = readStored();
  return snapshot;
}

/** Nothing is known during server rendering, so nothing is assumed. */
export function getConsentServerSnapshot(): ConsentState {
  return "unknown";
}

export function setConsent(state: Exclude<ConsentState, "unknown">): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, state);
  } catch {
    // Consent then isn't remembered across reloads, which is the
    // privacy-safe direction to fail in.
  }
  snapshot = state;
  for (const listener of listeners) listener();
}
