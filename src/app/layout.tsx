import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { ConsentBanner } from "@/components/layout/consent-banner";
import { AnalyticsProvider } from "@/lib/analytics/analytics-provider";
import { SITE } from "@/lib/constants";
import "./globals.css";

/*
  Plus Jakarta Sans, the single family specified in Design.md.

  Design.md loads it with an @import from Google Fonts. Routed through
  next/font instead, which self-hosts the files: identical typography, but a
  visitor's browser never calls Google — which matters for a mental-health
  page, where the mere request would disclose the visit to a third party.
*/
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-jakarta",
});

const TITLE = "Evi — Dein Begleiter für mentale Orientierung";
const DESCRIPTION =
  "Evi hilft dir, Gedanken zu sortieren, mentale Belastungen besser zu verstehen und passende nächste Schritte zu finden. Jetzt für Early Access vormerken.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: TITLE,
    template: "%s — Evi",
  },
  description: DESCRIPTION,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: SITE.url,
    siteName: SITE.name,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f8f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1c0d20" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      // Next 16 no longer overrides scroll-behavior during navigation unless
      // this attribute is present; without it, anchor smooth-scroll leaks into
      // route changes.
      data-scroll-behavior="smooth"
      className={`${jakarta.variable} h-full`}
    >
      <head>
        {/*
          Scroll reveals start at opacity 0 and are switched on by an
          IntersectionObserver. Without JavaScript that observer never runs, so
          this makes the content visible instead of blank.
        */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-brand-primary focus:px-5 focus:py-3 focus:font-semibold focus:text-white"
        >
          Zum Inhalt springen
        </a>

        <AnalyticsProvider>
          {children}
          <ConsentBanner />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
