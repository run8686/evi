import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ViewTracker } from "@/components/ui/view-tracker";
import { WaitlistForm } from "@/components/waitlist/waitlist-form";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

const ASSURANCES = [
  "Wir laden nach und nach kleine Gruppen ein.",
  "Du bekommst Bescheid, sobald ein Platz für dich frei ist.",
  "Keine Kosten, kein Abo, keine Verpflichtung.",
];

export function EarlyAccess() {
  return (
    <section id="early-access" className="section-y relative overflow-hidden">
      <ViewTracker event={ANALYTICS_EVENTS.earlyAccessSectionView} />

      {/* One drifting brand blob behind the panel, per Design.md. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute top-1/4 left-1/2 size-[34rem] -translate-x-1/2 rounded-full bg-gradient-brand opacity-[0.16] blur-[80px] motion-safe:animate-drift" />
      </div>

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <Reveal>
            <p className="text-[0.75rem] font-bold tracking-[0.1em] text-orange-700 uppercase">
              Early Access
            </p>
            <h2 className="mt-4 text-[clamp(1.875rem,4vw,3rem)] text-balance text-text-primary">
              Evi entsteht gerade. Du kannst früh dabei sein.
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-secondary">
              Wir öffnen Evi Schritt für Schritt für erste Tester:innen. Trag
              dich in die Warteliste ein und wir melden uns, sobald ein Platz
              für dich verfügbar ist.
            </p>

            {/* No bullet markers — separated by hairlines instead. */}
            <ul className="mt-8 border-t border-border">
              {ASSURANCES.map((item) => (
                <li
                  key={item}
                  className="border-b border-border py-3 text-text-tertiary"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <div className="glass rounded-[32px] p-6 sm:p-8">
              <WaitlistForm />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
