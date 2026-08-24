import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { SocialLinks } from "@/components/layout/social-links";
import { Container } from "@/components/ui/container";

const LEGAL_LINKS = [
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/impressum", label: "Impressum" },
  { href: "/#sicherheit", label: "Sicherheit & Grenzen" },
] as const;

/**
 * Transparent footer with a hairline top border, per Design.md — the page
 * background carries through rather than a dark slab closing it off.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:py-16">
          <div>
            {/* Light surface: mascot keeps its colours, wordmark stays black. */}
            <Logo />
            <p className="mt-4 max-w-xs text-[0.9375rem] leading-relaxed text-text-secondary">
              Ein Ort, um Gedanken zu sortieren und einen passenden nächsten
              Schritt zu finden.
            </p>
            <p className="mt-4 text-[0.8125rem] text-text-secondary">
              Evi von Zenmind
            </p>
          </div>

          <nav aria-label="Rechtliches">
            <h2 className="text-[0.75rem] font-semibold tracking-[0.1em] text-text-secondary uppercase">
              Rechtliches
            </h2>
            <ul className="mt-4 space-y-1">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-10 items-center text-[0.9375rem] text-text-tertiary [transition:color_var(--duration-base)_var(--ease-standard)] hover:text-text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                {/* Never buried: the route to real help stays one tap away. */}
                <Link
                  href="/akute-hilfe"
                  className="inline-flex min-h-10 items-center text-[0.9375rem] font-semibold text-text-primary [transition:color_var(--duration-base)_var(--ease-standard)] hover:text-link"
                >
                  Akute Hilfe
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-[0.75rem] font-semibold tracking-[0.1em] text-text-secondary uppercase">
              Folgen
            </h2>
            <SocialLinks showLabels className="mt-4" />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border py-6 text-[0.8125rem] text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Zenmind. Alle Rechte vorbehalten.</p>
          <p>
            Evi ersetzt keine Psychotherapie oder medizinische Behandlung und
            stellt keine Diagnose.
          </p>
        </div>
      </Container>
    </footer>
  );
}
