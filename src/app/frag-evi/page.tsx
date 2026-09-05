import type { Metadata } from "next";
import Link from "next/link";

import { AskEvi } from "@/components/sections/ask-evi";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Frag Evi selbst",
  description:
    "Frag Evi direkt, wofür sie da ist und wie sie antwortet — bevor du dich für den Early Access einträgst.",
  robots: { index: true, follow: true },
};

/**
 * Standalone page for the live chat demo, reached from the nav ("Frag Evi")
 * rather than embedded inline on the homepage — keeps the marketing scroll
 * short and gives the widget its own room.
 */
export default function FragEviPage() {
  return (
    <>
      <SiteHeader />
      <main id="inhalt" className="flex-1">
        <div className="pt-24">
          <Container>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 text-[0.95rem] font-medium text-text-tertiary hover:text-text-primary"
            >
              <span aria-hidden="true">←</span> Zurück zur Startseite
            </Link>
          </Container>
        </div>

        <AskEvi />
      </main>
      <SiteFooter />
    </>
  );
}
