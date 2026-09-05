import Link from "next/link";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Container } from "@/components/ui/container";

/**
 * Layout for the standalone content pages behind the landing page:
 * /frag-evi, /akute-hilfe, /impressum, /datenschutz and the two
 * /warteliste routes.
 *
 * Every one of them renders through here, so this file is what pulls them onto
 * the landing page's type scale — the same -0.045em display tracking, the same
 * 40px radii, the same pill back-link. Their content and logic are untouched.
 */
export function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="inhalt" className="flex-1 pt-28 pb-20 sm:pt-36 sm:pb-28">
        <Container>
          <div className="mx-auto max-w-2xl">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[0.9375rem] font-semibold text-text-secondary [transition:background_var(--duration-base)_var(--ease-standard),color_var(--duration-base)_var(--ease-standard)] hover:bg-bg-subtle hover:text-text-primary"
            >
              <span aria-hidden="true">←</span> Zurück zur Startseite
            </Link>

            <h1 className="mt-7 text-[clamp(1.9rem,5.2vw,3.25rem)] leading-[1.06] font-extrabold tracking-[-0.045em] text-balance text-text-primary">
              {title}
            </h1>

            {intro ? (
              <p className="mt-5 text-lg leading-relaxed text-text-secondary text-pretty">
                {intro}
              </p>
            ) : null}

            <div className="mt-10 space-y-8">{children}</div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}

/** A titled block of prose, sized for comfortable reading. */
export function Prose({
  heading,
  children,
}: {
  heading?: string;
  children: ReactNode;
}) {
  return (
    <section>
      {heading ? (
        <h2 className="text-[clamp(1.25rem,2.4vw,1.625rem)] font-extrabold tracking-[-0.03em] text-text-primary">
          {heading}
        </h2>
      ) : null}
      {/*
        Lists have no bullet markers anywhere on this site; items are separated
        by hairlines instead.
      */}
      <div className="mt-3 space-y-3 leading-relaxed text-text-secondary [&_a]:font-bold [&_a]:text-link [&_a]:underline [&_a]:underline-offset-2 [&_li]:list-none [&_li]:border-b [&_li]:border-border [&_li]:py-2.5 [&_strong]:font-bold [&_strong]:text-text-primary [&_ul]:border-t [&_ul]:border-border">
        {children}
      </div>
    </section>
  );
}

/**
 * Marks content that is genuinely not written yet. Used instead of inventing
 * legal text or company details, which would be fabricating a record.
 */
export function PendingNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[32px] border border-border bg-bg-subtle p-6 leading-relaxed text-text-secondary">
      {children}
    </div>
  );
}
