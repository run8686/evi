import { Mascot } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { TrackedCta } from "@/components/ui/tracked-cta";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-brand-soft pt-32 pb-16 sm:pt-40 md:pb-24 lg:pt-44">
      {/*
        Two slowly drifting blobs, per Design.md. Decorative only — the bright
        brand gradient is not readable behind text, so nothing sits on them.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-32 -right-24 size-[32rem] rounded-full bg-gradient-brand opacity-[0.18] blur-[75px] motion-safe:animate-drift" />
        <div className="absolute -bottom-40 -left-32 size-[26rem] rounded-full bg-periwinkle-300 opacity-[0.14] blur-[70px] motion-safe:animate-drift-slow" />
      </div>

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div>
            <p className="inline-flex items-center rounded-full bg-orange-50 px-4 py-2 text-[0.75rem] font-bold tracking-[0.1em] text-orange-700 uppercase">
              Evi Early Access
            </p>

            <h1 className="mt-6 text-[clamp(2.25rem,6vw,4rem)] text-balance text-text-primary">
              Verstehen, was gerade{" "}
              <span className="text-orange-700">in dir los ist.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary sm:text-xl">
              Evi hilft dir, Gedanken zu sortieren, mentale Belastungen besser
              zu verstehen und einen passenden nächsten Schritt zu finden.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <TrackedCta
                href="#early-access"
                event={ANALYTICS_EVENTS.heroEarlyAccessClick}
                size="lg"
              >
                Early Access sichern
              </TrackedCta>

              <TrackedCta
                href="#was-ist-evi"
                event={ANALYTICS_EVENTS.earlyAccessClick}
                location="hero_secondary"
                variant="ghost"
                size="lg"
              >
                Evi kennenlernen
                <span aria-hidden="true" className="text-lg leading-none">
                  ↓
                </span>
              </TrackedCta>
            </div>

            <p className="mt-6 text-[0.9375rem] leading-relaxed text-text-secondary">
              Kostenlos zur Warteliste. Wir öffnen Evi schrittweise für erste
              Tester:innen.
            </p>
          </div>

          <HeroVisual />
        </div>
      </Container>
    </section>
  );
}

/**
 * An illustration of how a conversation with Evi is meant to feel — sorting
 * something out and landing on a next step. It is a designed impression of the
 * planned product, not a screenshot of a shipped one, so it shows structure
 * rather than promising any specific capability.
 */
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="glass relative rounded-[32px] p-5 sm:p-6">
        <div className="flex items-center gap-3 border-b border-white/50 pb-4">
          {/* Mascot artwork is never altered; a drop-shadow is the one allowed effect. */}
          <Mascot
            className="h-10 w-auto drop-shadow-[0_6px_16px_rgba(233,79,176,0.28)]"
            priority
          />
          <div>
            <p className="text-[0.9375rem] font-bold text-text-primary">Evi</p>
            <p className="text-[0.8125rem] text-text-secondary">
              Dein Raum zum Sortieren
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-5">
          <p className="ml-auto max-w-[85%] rounded-[20px] rounded-br-md bg-white/70 px-4 py-3 text-[0.9375rem] leading-relaxed text-text-primary">
            Ich weiß gerade nicht, wo ich anfangen soll.
          </p>

          <p className="max-w-[90%] rounded-[20px] rounded-bl-md bg-orange-50 px-4 py-3 text-[0.9375rem] leading-relaxed text-text-primary">
            Das muss auch noch nicht klar sein. Lass uns zuerst sortieren, was
            gerade am meisten Raum einnimmt.
          </p>
        </div>

        <div className="mt-5 border-t border-white/50 pt-4">
          <p className="text-[0.75rem] font-semibold tracking-[0.1em] text-text-secondary uppercase">
            Mögliche nächste Schritte
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {[
              "Gedanken sortieren",
              "Belastung einordnen",
              "Unterstützung finden",
            ].map((step) => (
              <li
                key={step}
                className="rounded-full border border-border bg-white/60 px-3 py-1.5 text-[0.8125rem] font-medium text-text-tertiary"
              >
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Small floating card, offset so it reads as depth rather than clutter. */}
      <div className="glass absolute -bottom-5 -left-3 hidden items-center rounded-full px-5 py-3 sm:flex lg:-left-6">
        <p className="text-[0.8125rem] font-semibold text-text-primary">
          In deinem Tempo
        </p>
      </div>
    </div>
  );
}
