/**
 * The complete set of events this page is allowed to send.
 *
 * Hard rule: nothing a person types goes to analytics. No e-mail address, no
 * first name, no free text — ever. Events carry only the funnel step and
 * channel attribution, which is all we need to answer "which channel actually
 * brings people who sign up".
 */

export const ANALYTICS_EVENTS = {
  landingPageView: "landing_page_view",
  heroEarlyAccessClick: "hero_early_access_click",
  navbarEarlyAccessClick: "navbar_early_access_click",
  earlyAccessSectionView: "early_access_section_view",
  waitlistFormStart: "waitlist_form_start",
  waitlistSubmitSuccess: "waitlist_submit_success",
  waitlistSubmitError: "waitlist_submit_error",
  instagramClick: "instagram_click",
  tiktokClick: "tiktok_click",
  linkedinClick: "linkedin_click",
  /** Any Early-Access CTA outside the hero and navbar; carries `location`. */
  earlyAccessClick: "early_access_click",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/**
 * Only these property keys may ever be attached to an event. Anything else is
 * dropped in track(), so a careless call site cannot leak user input.
 */
const ALLOWED_PROPERTY_KEYS = new Set([
  "location",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "referrer",
  "reason",
  "marketing_consent",
  "has_first_name",
]);

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

function sanitize(properties?: AnalyticsProperties): AnalyticsProperties {
  if (!properties) return {};
  const safe: AnalyticsProperties = {};
  for (const [key, value] of Object.entries(properties)) {
    if (!ALLOWED_PROPERTY_KEYS.has(key)) continue;
    if (value === null || value === undefined) continue;
    if (typeof value === "string") {
      // Length-capped: a property should never carry a paragraph of text.
      safe[key] = value.slice(0, 200);
    } else {
      safe[key] = value;
    }
  }
  return safe;
}

/**
 * Sends an event if — and only if — PostHog has been loaded, which only
 * happens after the visitor accepted analytics. Without consent this is a
 * silent no-op, so call sites never need to check.
 */
export async function track(
  event: AnalyticsEvent,
  properties?: AnalyticsProperties,
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const { default: posthog } = await import("posthog-js");
    if (!posthog.__loaded) return;
    posthog.capture(event, sanitize(properties));
  } catch {
    // Analytics must never break the page or the signup flow.
  }
}
