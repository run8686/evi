import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const POINTS = [
  {
    title: "Keine Therapie — und evi sagt es dir.",
    body: "Kein Arzt, keine Diagnose, kein Krisendienst. Wo etwas anderes wichtiger ist, benennt evi das.",
  },
  {
    title: "Deine Gespräche sind kein Geschäftsmodell.",
    body: "Nicht verkauft, nicht für Werbeprofile genutzt, nicht zum Training allgemeiner KI-Modelle monetarisiert.",
  },
  {
    title: "Mit Psycholog:innen entwickelt.",
    body: "Fachliche Begleitung dabei, wie evi reagiert — besonders dort, wo Gespräche sensibel werden.",
    link: { href: "#vertrauen", label: "Mehr dazu" },
  },
] as const;

/**
 * The three questions people ask before they trust a mental-health product,
 * answered above the fold of the second screen — with a hairline rule instead
 * of cards, so it reads as a footnote to the conversation above it rather than
 * as a feature grid.
 */
export function TrustBrief() {
  return (
    <section aria-label="Grenzen und Zusagen, kurz" className="px-5 pb-14 sm:px-8 sm:pb-24">
      <Container className="!px-0">
        <div className="grid gap-6 border-t border-border pt-8 sm:grid-cols-3 sm:gap-8 sm:pt-11">
          {POINTS.map((point, index) => (
            <Reveal key={point.title} delay={index * 110} className="flex flex-col gap-2">
              <h3 className="text-[1.3125rem] leading-tight font-extrabold tracking-[-0.025em]">
                {point.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary text-pretty">
                {point.body}{" "}
                {"link" in point && point.link ? (
                  <a
                    href={point.link.href}
                    className="font-bold whitespace-nowrap text-link underline underline-offset-2"
                  >
                    {point.link.label}
                  </a>
                ) : null}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
