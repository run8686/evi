import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AskEvi } from "@/components/sections/ask-evi";
import { EarlyAccess } from "@/components/sections/early-access";
import { ForOthers } from "@/components/sections/for-others";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Pillars } from "@/components/sections/pillars";
import { Problem } from "@/components/sections/problem";
import { Safety } from "@/components/sections/safety";
import { Trust } from "@/components/sections/trust";

/**
 * Section order follows the trust ladder: understand the situation, then what
 * Evi does, then how it works, then a chance to try asking it directly, then
 * what it deliberately does not do, then privacy — and only after all of
 * that, the signup.
 */
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="inhalt" className="flex-1">
        <Hero />
        <Problem />
        <Pillars />
        <HowItWorks />
        <AskEvi />
        <ForOthers />
        <Safety />
        <Trust />
        <EarlyAccess />
      </main>
      <SiteFooter />
    </>
  );
}
