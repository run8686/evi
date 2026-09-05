import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AcuteHelp } from "@/components/sections/acute-help";
import { Conversation } from "@/components/sections/conversation";
import { EarlyAccess } from "@/components/sections/early-access";
import { Faq } from "@/components/sections/faq";
import { FullCircle } from "@/components/sections/full-circle";
import { Hero } from "@/components/sections/hero";
import { NextStep } from "@/components/sections/next-step";
import { Perspectives } from "@/components/sections/perspectives";
import { StartingPoints } from "@/components/sections/starting-points";
import { StatusLine } from "@/components/sections/status-line";
import { TrustBrief } from "@/components/sections/trust-brief";
import { WhyEvi } from "@/components/sections/why-evi";

/**
 * Section order follows the trust ladder, and each rung answers the objection
 * the previous one raises:
 *
 *   Hero          — what this is, in one sentence over a real face
 *   StatusLine    — it is not finished; said before anything is promised
 *   Conversation  — what it actually looks like, as a transcript
 *   TrustBrief    — the three questions that transcript provokes
 *   StartingPoints— you do not need a reason to start
 *   Perspectives  — for you, or for someone you care about
 *   WhyEvi        — why not ChatGPT, a mood tracker, a meditation app
 *   NextStep      — the scroll-driven map of where a conversation can lead
 *   FullCircle    — what happens when a conversation is not enough
 *   Trust         — the limits, on the page's only dark surface
 *   EarlyAccess   — the ask, last
 *   AcuteHelp     — the exit that must never be hard to find
 *   Faq           — everything the sections left open
 *
 * The live chat demo stays on its own page (/frag-evi, linked from the menu).
 */
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="inhalt" className="flex-1">
        <Hero />
        <StatusLine />
        <Conversation />
        <TrustBrief />
        <StartingPoints />
        <Perspectives />
        <WhyEvi />
        <NextStep />
        <FullCircle />
        <Trust />
        <EarlyAccess />
        <AcuteHelp />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
