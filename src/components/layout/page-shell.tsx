import Link from "next/link";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Container } from "@/components/ui/container";

/** Layout for the standalone content pages behind the landing page. */
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
              className="inline-flex min-h-11 items-center gap-2 text-[0.95rem] font-medium text-text-tertiary hover:text-text-primary"
            >
              <span aria-hidden="true">←</span> Zurück zur Startseite
            </Link>

            <h1 className="mt-6 text-[2.1rem] leading-[1.1] font-extrabold tracking-[-0.025em] text-balance text-text-primary sm:text-5xl">
              {title}
            </h1>

            {intro ? (
              <p className="mt-5 text-lg leading-relaxed text-text-tertiary">
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
        <h2 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
          {heading}
        </h2>
      ) : null}
      {/*
        Lists have no bullet markers anywhere on this site; items are separated
        by hairlines instead.
      */}
      <div className="mt-3 space-y-3 leading-relaxed text-text-tertiary [&_a]:font-medium [&_a]:text-link [&_a]:underline [&_a]:underline-offset-2 [&_li]:list-none [&_li]:border-b [&_li]:border-border [&_li]:py-2.5 [&_strong]:font-semibold [&_strong]:text-text-primary [&_ul]:border-t [&_ul]:border-border">
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
    <div className="rounded-2xl border border-border bg-bg-sunken p-5 text-[0.95rem] leading-relaxed text-text-tertiary">
      {children}
    </div>
  );
}
