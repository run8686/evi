import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

/**
 * Real sentences people arrive with, in the first person. They are the section's
 * whole argument: none of them is a diagnosis, and every one of them is enough.
 */
const STARTING_POINTS = [
  "Ich drehe mich gerade im Kreis.",
  "Ich verstehe meine eigene Reaktion nicht.",
  "Ich muss eine Entscheidung treffen.",
  "Ich will jemanden nicht belasten.",
  "Ich mache mir Sorgen um jemanden.",
  "Ich weiß einfach nicht weiter.",
] as const;

export function StartingPoints() {
  return (
    <section
      className="section-y relative overflow-hidden bg-bg-subtle px-5 sm:px-8"
      aria-labelledby="anlass-titel"
    >
      {/* Decorative only — no text ever sits on --gradient-brand. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[120px] -right-[120px] size-[420px] rounded-full opacity-10 blur-[80px] [background-image:var(--gradient-brand)] motion-safe:animate-blob"
      />

      <Container className="relative !px-0">
        <div className="flex flex-col items-center gap-9 sm:gap-14">
          <div className="flex max-w-[720px] flex-col items-center gap-4 text-center">
            <Reveal>
              <h2
                id="anlass-titel"
                className="text-[clamp(1.9rem,5.2vw,3.4rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-pretty"
              >
                Du brauchst keinen Anlass.
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="text-lg leading-relaxed text-text-secondary text-pretty">
                Keine Diagnose, keine Kategorie, keinen Namen für das, was gerade
                los ist. Es reicht, dort anzufangen, wo du bist.
              </p>
            </Reveal>
          </div>

          <ul className="flex max-w-[860px] flex-wrap justify-center gap-2.5 sm:gap-4">
            {STARTING_POINTS.map((point, index) => (
              <Reveal as="li" key={point} delay={index * 80}>
                <span className="block rounded-full border border-border bg-surface px-5 py-3.5 text-[1.0625rem] font-bold tracking-[-0.015em] shadow-sm sm:px-6 sm:py-4 sm:text-[1.1875rem]">
                  {point}
                </span>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={200}>
            <p className="max-w-[560px] text-center text-text-tertiary text-pretty">
              evi ist nicht nur für Menschen mit einer psychischen Erkrankung.
              evi ist für alles, was einen innerlich beschäftigt. Für Erwachsene
              ab 18.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
