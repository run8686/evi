/**
 * First-touch attribution capture.
 *
 * We need to compare waitlist conversion by channel (TikTok / Instagram /
 * LinkedIn / campaign), so the UTM parameters and referrer are read once on
 * arrival and kept for the rest of the session. First touch wins: if someone
 * lands from TikTok and later navigates to /datenschutz and back, the original
 * source is not overwritten by an empty one.
 *
 * Nothing here is personal data beyond the referring URL, and none of it is
 * ever combined with what a person writes into the form.
 */

const STORAGE_KEY = "evi.attribution";

/** Defensive cap — these values end up in a database column and in analytics. */
const MAX_LEN = 200;

export type Attribution = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  referrer: string | null;
};

export const EMPTY_ATTRIBUTION: Attribution = {
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmContent: null,
  utmTerm: null,
  referrer: null,
};

function clean(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, MAX_LEN);
}

/** document.referrer, but only when it actually points somewhere else. */
function externalReferrer(): string | null {
  if (!document.referrer) return null;
  try {
    const ref = new URL(document.referrer);
    if (ref.host === window.location.host) return null;
    return clean(document.referrer);
  } catch {
    return null;
  }
}

function read(): Attribution | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return { ...EMPTY_ATTRIBUTION, ...(parsed as Partial<Attribution>) };
  } catch {
    // Private-mode Safari and disabled storage both throw here. Attribution is
    // a nice-to-have, so degrade silently rather than breaking the page.
    return null;
  }
}

/**
 * Cached so getAttribution() returns a stable object identity. Components read
 * it through useSyncExternalStore, which compares snapshots by identity and
 * would re-render endlessly if a fresh object came back each time.
 */
let cached: Attribution | null = null;

/**
 * Reads attribution from the current URL, merges it over anything already
 * stored (existing non-empty values win), persists and returns the result.
 * Safe to call on every mount.
 */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return EMPTY_ATTRIBUTION;

  const params = new URLSearchParams(window.location.search);
  const stored = read();

  const fromUrl: Attribution = {
    utmSource: clean(params.get("utm_source")),
    utmMedium: clean(params.get("utm_medium")),
    utmCampaign: clean(params.get("utm_campaign")),
    utmContent: clean(params.get("utm_content")),
    utmTerm: clean(params.get("utm_term")),
    referrer: externalReferrer(),
  };

  const merged: Attribution = { ...EMPTY_ATTRIBUTION };
  for (const key of Object.keys(EMPTY_ATTRIBUTION) as (keyof Attribution)[]) {
    merged[key] = stored?.[key] ?? fromUrl[key];
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Ignore — see note in read().
  }

  cached = merged;
  return merged;
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return EMPTY_ATTRIBUTION;
  if (!cached) cached = captureAttribution();
  return cached;
}

/** Nothing is knowable during server rendering. */
export function getAttributionServerSnapshot(): Attribution {
  return EMPTY_ATTRIBUTION;
}

/**
 * Attribution is captured once on arrival and never changes afterwards, so
 * there is nothing to subscribe to — this exists only to satisfy
 * useSyncExternalStore's contract.
 */
export function subscribeAttribution(): () => void {
  return () => {};
}

/** Flattens attribution into the snake_case field names the form submits. */
export function attributionFormFields(
  attribution: Attribution,
): Record<string, string> {
  const fields: Record<string, string> = {};
  if (attribution.utmSource) fields.utm_source = attribution.utmSource;
  if (attribution.utmMedium) fields.utm_medium = attribution.utmMedium;
  if (attribution.utmCampaign) fields.utm_campaign = attribution.utmCampaign;
  if (attribution.utmContent) fields.utm_content = attribution.utmContent;
  if (attribution.utmTerm) fields.utm_term = attribution.utmTerm;
  if (attribution.referrer) fields.referrer = attribution.referrer;
  return fields;
}
