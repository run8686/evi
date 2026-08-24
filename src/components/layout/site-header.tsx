"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "@/components/brand/logo";
import { buttonStyles } from "@/components/ui/button";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics/events";
import { NAV_LINKS } from "@/lib/constants";

/**
 * Floating glass navbar, per Design.md: a centred pill that sits 16px below the
 * top of the viewport rather than spanning the full width.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // The pill gains a touch more presence once the page moves under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the mobile panel is open: Escape closes it and the page behind it
  // cannot scroll away underneath.
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
      <div className="mx-auto w-full max-w-[1200px]">
        <div
          className={`glass rounded-full px-4 py-2.5 sm:px-5 ${
            scrolled || menuOpen ? "shadow-md" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <Link href="/" aria-label="Evi – zum Seitenanfang" className="shrink-0">
              <Logo priority />
            </Link>

            <nav aria-label="Hauptnavigation" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="rounded-full px-4 py-2 text-[0.9375rem] font-medium text-text-tertiary [transition:background_var(--duration-base)_var(--ease-standard),color_var(--duration-base)_var(--ease-standard)] hover:bg-white/60 hover:text-text-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              {/* Wrapper carries the visibility — see the note in button.tsx. */}
              <span className="hidden sm:inline-flex">
                <a
                  href="#early-access"
                  onClick={onCtaClick}
                  className={buttonStyles({ size: "md" })}
                >
                  Early Access sichern
                </a>
              </span>

              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
                className="inline-flex size-11 items-center justify-center rounded-full text-text-primary [transition:background_var(--duration-base)_var(--ease-standard)] hover:bg-white/60 lg:hidden"
              >
                <MenuIcon open={menuOpen} />
              </button>
            </div>
          </div>
        </div>

        {menuOpen ? (
          <div
            id="mobile-menu"
            className="glass mt-2 rounded-[32px] p-4 lg:hidden"
          >
            <nav aria-label="Hauptnavigation mobil">
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-12 items-center rounded-full px-4 text-lg font-medium text-text-primary [transition:background_var(--duration-base)_var(--ease-standard)] hover:bg-white/60"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href="#early-access"
                onClick={onCtaClick}
                className={buttonStyles({ size: "lg", className: "mt-3 w-full" })}
              >
                Early Access sichern
              </a>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      aria-hidden="true"
      className="size-6"
    >
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M3.5 7.5h17" />
          <path d="M3.5 16.5h17" />
        </>
      )}
    </svg>
  );
}
