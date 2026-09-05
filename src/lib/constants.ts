/**
 * Central configuration for content that has to be swapped before launch.
 *
 * Anything marked TODO is a deliberate placeholder: it is better to ship an
 * obvious gap than an invented URL, phone number or claim.
 */

/**
 * Absolute base URL for canonical links, Open Graph and the sitemap.
 *
 * No domain is hardcoded here on purpose. Evi is the brand people see, so the
 * address should not carry another name, and guessing one would put the wrong
 * host into every share preview. The value is resolved in this order:
 *
 *   1. NEXT_PUBLIC_SITE_URL — set this once the real domain exists.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — the project's stable production domain.
 *   3. VERCEL_URL — this specific deployment. Anonymous and preview
 *      deployments do not get a production domain, and without this the URLs
 *      would fall back to localhost, which silently breaks every link preview.
 *   4. localhost — development only.
 */
function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const productionDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionDomain) return `https://${productionDomain.replace(/\/+$/, "")}`;

  const deploymentDomain = process.env.VERCEL_URL?.trim();
  if (deploymentDomain) return `https://${deploymentDomain.replace(/\/+$/, "")}`;

  if (process.env.NODE_ENV === "production") {
    // Loud rather than silently wrong: a bad canonical is hard to notice later.
    console.warn(
      "[evi] Neither NEXT_PUBLIC_SITE_URL nor VERCEL_PROJECT_PRODUCTION_URL is set. " +
        "Canonical, Open Graph and sitemap URLs will point at localhost.",
    );
  }

  return "http://localhost:3000";
}

export const SITE = {
  name: "Evi",
  url: resolveSiteUrl(),
  locale: "de-DE",
} as const;

/** TikTok and LinkedIn are still TODO: replace with the real URLs before launch. */
export const SOCIAL = {
  instagram: "https://www.instagram.com/evi.mental",
  tiktok: "https://tiktok.com/",
  linkedin: "https://linkedin.com/",
} as const;

/**
 * Used as the honest fallback the "Frag Evi selbst" chat offers when a
 * question falls outside its master document — see
 * src/lib/evi-chat/system-prompt.server.ts.
 */
export const SUPPORT_EMAIL = "hello@evi-health.eu";

/** Postal address for the footer and the Impressum. */
export const COMPANY = {
  legalName: "evihealth UG",
  street: "Waldenserstr. 30",
  city: "10551 Berlin",
} as const;

/**
 * Section anchors, in page order. The labels are the section names people see
 * as they scroll, so the menu reads as a map of the page rather than a set of
 * feature words.
 */
export const NAV_LINKS = [
  { href: "#so-funktioniert", label: "So funktioniert evi" },
  { href: "#warum-evi", label: "Warum evi" },
  { href: "/frag-evi", label: "Frag evi" },
  { href: "#vertrauen", label: "Vertrauen" },
  { href: "#faq", label: "FAQ" },
] as const;

/**
 * Verified crisis resources.
 *
 * Confirmed for release: the German emergency number and the two round-the-clock
 * Telefonseelsorge lines. Nothing goes in this list that has not been checked
 * by a human — a wrong number on this page is actively dangerous.
 */
export type AcuteHelpResource = {
  name: string;
  description: string;
  /** Phone number in a dialable format, e.g. "0800 1110111". */
  phone?: string;
  /** Website of the service. */
  href?: string;
  /** e.g. "24/7", "Mo–Fr 9–17 Uhr". */
  availability?: string;
};

export const ACUTE_HELP_RESOURCES: readonly AcuteHelpResource[] = [
  {
    name: "Notruf",
    description:
      "Bei akuter Lebensgefahr — für dich oder für jemand anderen. Rund um die Uhr erreichbar.",
    phone: "112",
    availability: "24/7",
  },
  {
    name: "Telefonseelsorge",
    description:
      "Kostenlos, anonym und ohne Anlass. Jemand hört zu, auch mitten in der Nacht.",
    phone: "0800 111 0 111",
    availability: "24/7",
  },
  {
    // Distinct name: /akute-hilfe keys its list by name, and two identical
    // names there would collide.
    name: "Telefonseelsorge, zweite Leitung",
    description:
      "Dieselbe Beratung — wenn die erste Leitung gerade belegt ist.",
    phone: "0800 111 0 222",
    availability: "24/7",
  },
];
