"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "@/components/brand/logo";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics/events";
import { NAV_LINKS } from "@/lib/constants";

/**
 * Floating glass navbar: a centred pill 16px below the top of the viewport.
 *
 * Three columns, and the middle one is the logo — so the mark sits optically
 * centred on every width instead of drifting with the length of the menu. The
 * burger is on the left at all sizes; the page has nine sections and a
 * horizontal list of them would either truncate or crowd the mark.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes the panel; the page behind it cannot scroll away underneath.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const onCtaClick = () => {
    void track(ANALYTICS_EVENTS.navbarEarlyAccessClick);
    setMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6">
      <div className="relative mx-auto w-full max-w-[1200px]">
        <div
          className={`glass grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-full px-3 py-2.5 sm:px-4 ${
            scrolled || menuOpen ? "shadow-md" : ""
          }`}
        >
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
              className="inline-flex h-11 items-center justify-center rounded-full border border-black/15 px-3.5 text-text-primary [transition:background_var(--duration-base)_var(--ease-standard)] hover:bg-white/50"
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>

          <Link
            href="/"
            aria-label="evi – zum Seitenanfang"
            className="flex shrink-0 items-center justify-center"
          >
            <Logo priority />
          </Link>

          <div className="flex justify-end">
            {/* One gradient button per view, and it always means the same thing. */}
            <a
              href="#early-access"
              onClick={onCtaClick}
              className="inline-flex min-h-11 items-center justify-center rounded-full px-4 text-[0.9375rem] font-bold tracking-[-0.01em] whitespace-nowrap text-white [background-image:var(--gradient-cta)] [box-shadow:var(--shadow-glow-brand)] [transition:transform_var(--duration-base)_var(--ease-standard),background_var(--duration-base)_var(--ease-standard)] hover:[background-image:var(--gradient-cta-hover)] motion-safe:hover:scale-[1.04] motion-safe:active:scale-[0.98] sm:px-6"
            >
              <span className="sm:hidden">Zugang</span>
              <span className="hidden sm:inline">Early Access</span>
            </a>
          </div>
        </div>

        {menuOpen ? (
          <div
            id="site-menu"
            className="glass absolute top-[calc(100%+10px)] left-0 z-10 flex w-[min(19rem,calc(100vw-2.5rem))] flex-col gap-0.5 rounded-[32px] p-3"
          >
            <nav aria-label="Hauptnavigation">
              <ul className="flex flex-col gap-0.5">
                {NAV_LINKS.map((link) =>
                  link.href.startsWith("/") ? (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-12 items-center rounded-2xl px-3.5 font-bold text-text-primary [transition:background_var(--duration-base)_var(--ease-standard)] hover:bg-white/60"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-12 items-center rounded-2xl px-3.5 font-bold text-text-primary [transition:background_var(--duration-base)_var(--ease-standard)] hover:bg-white/60"
                      >
                        {link.label}
                      </a>
                    </li>
                  ),
                )}
                <li>
                  {/* The route to real help is never more than one tap away. */}
                  <a
                    href="#akuthilfe"
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-12 items-center rounded-2xl px-3.5 text-sm font-semibold text-text-secondary [transition:background_var(--duration-base)_var(--ease-standard)] hover:bg-white/60"
                  >
                    Wenn es akut ist
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        aria-hidden="true"
        className="size-6"
      >
        <path d="M6 6l12 12" />
        <path d="M18 6L6 18" />
      </svg>
    );
  }

  // Three bars, matching the stroke weight of the wordmark next to it.
  return (
    <span aria-hidden="true" className="flex w-5 flex-col gap-[5px]">
      <span className="h-[2.5px] rounded-full bg-current" />
      <span className="h-[2.5px] rounded-full bg-current" />
      <span className="h-[2.5px] rounded-full bg-current" />
    </span>
  );
}
