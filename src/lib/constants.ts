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

export const NAV_LINKS = [
  { href: "#was-ist-evi", label: "Was ist Evi?" },
  { href: "#fuer-dich", label: "Für dich" },
  { href: "/frag-evi", label: "Frag Evi" },
  { href: "#sicherheit", label: "Sicherheit" },
  { href: "#early-access", label: "Early Access" },
] as const;

/**
 * Verified crisis resources.
 *
 * Intentionally EMPTY. Emergency numbers and crisis services must be supplied
 * and verified by a human before they appear on a mental-health page — a wrong
 * number here is actively dangerous. Until this is filled, /akute-hilfe shows
 * generic, non-specific guidance instead (see src/app/akute-hilfe/page.tsx).
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

export const ACUTE_HELP_RESOURCES: readonly AcuteHelpResource[] = [];
