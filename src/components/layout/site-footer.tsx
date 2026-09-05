import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { SocialLinks } from "@/components/layout/social-links";
import { Container } from "@/components/ui/container";
import { COMPANY, SUPPORT_EMAIL } from "@/lib/constants";

const PAGE_LINKS = [
  { href: "#so-funktioniert", label: "So funktioniert evi" },
  { href: "#warum-evi", label: "Warum evi" },
  { href: "#vertrauen", label: "Vertrauen" },
  { href: "#faq", label: "FAQ" },
  { href: "#akuthilfe", label: "Wenn es akut ist" },
] as const;

const LEGAL_LINKS = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
] as const;

/**
 * Four columns on a sunken warm surface: brand, page, contact, legal.
 *
 * The disclaimer sits in the last line at full opacity rather than greyed out —
 * it is the most consequential sentence on the page, not fine print.
 */
export function SiteFooter() {
  return (
    <footer className="bg-bg-subtle">
      <Container>
        <div className="flex flex-col gap-8 py-12 sm:py-16">
          <div className="flex flex-wrap justify-between gap-8">
            <div className="flex max-w-xs flex-col gap-3.5">
              {/* Light surface: mascot keeps its colours, wordmark stays black. */}
              <Link href="/" aria-label="evi – zum Seitenanfang">
                <Logo />
              </Link>
              <p className="text-[0.9375rem] leading-relaxed text-text-secondary text-pretty">
                Ein persönlicher digitaler Begleiter für alles, was dich
                innerlich beschäftigt.
              </p>
            </div>

            <nav aria-label="Seite" className="flex flex-col gap-2.5">
              <h2 className="text-[0.75rem] font-extrabold tracking-[0.1em] text-text-tertiary uppercase">
                Seite
              </h2>
              {PAGE_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[0.9375rem] font-semibold text-text-secondary [transition:color_var(--duration-base)_var(--ease-standard)] hover:text-text-primary"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex flex-col gap-2.5">
              <h2 className="text-[0.75rem] font-extrabold tracking-[0.1em] text-text-tertiary uppercase">
                Kontakt
              </h2>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-[0.9375rem] font-semibold text-text-secondary [transition:color_var(--duration-base)_var(--ease-standard)] hover:text-text-primary"
              >
                {SUPPORT_EMAIL}
              </a>
              <SocialLinks showLabels className="mt-1" />
            </div>

            <nav aria-label="Rechtliches" className="flex flex-col gap-2.5">
              <h2 className="text-[0.75rem] font-extrabold tracking-[0.1em] text-text-tertiary uppercase">
                Rechtliches
              </h2>
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[0.9375rem] font-semibold text-text-secondary [transition:color_var(--duration-base)_var(--ease-standard)] hover:text-text-primary"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/akute-hilfe"
                className="text-[0.9375rem] font-bold text-text-primary [transition:color_var(--duration-base)_var(--ease-standard)] hover:text-link"
              >
                Akute Hilfe
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-border pt-6">
            <p className="text-[0.8125rem] text-text-tertiary">
              {COMPANY.legalName} · {COMPANY.street} · {COMPANY.city} · ©{" "}
              {new Date().getFullYear()}
            </p>
            <p className="text-[0.8125rem] text-text-tertiary text-pretty">
              evi ersetzt keine Therapie, Diagnose oder ärztliche Behandlung und
              ist kein Krisendienst. Für Erwachsene ab 18 Jahren.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
