import Image from "next/image";

import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const STEPS = [
  {
    step: "Schritt 1",
    title: "Reden",
    body: "Ein Gespräch über das, was dich beschäftigt.",
  },
  {
    step: "Schritt 2",
    title: "Klarheit",
    body: "Sortieren, was passiert ist — und was du gerade hineinlegst.",
  },
  {
    step: "Schritt 3",
    title: "Dein Schritt",
    body: "Ein nächster Schritt, den du dir selbst zutraust.",
  },
  {
    step: "Schritt 4",
    title: "Ein evi Guide",
    body: "Ein Mensch, der dich begleitet, wenn ein Gespräch nicht mehr reicht.",
  },
  {
    step: "Schritt 5",
    title: "Professionelle Hilfe",
    body: "Begleitung bis dorthin — zum Beispiel bei der Therapieplatzsuche.",
  },
] as const;

/**
 * Why the handover is a product decision, not a disclaimer.
 *
 * "Wende dich an professionelle Hilfe" is the sentence people give up on, so
 * the human layer that follows it is presented as part of Evi rather than as
 * an exit.
 */
export function FullCircle() {
  return (
    <section
      className="section-y relative overflow-hidden bg-bg-subtle px-5 sm:px-8"
      aria-labelledby="full-circle-titel"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[160px] -left-[120px] size-[420px] rounded-full opacity-10 blur-[80px] [background-image:var(--gradient-brand)] motion-safe:animate-blob-reverse"
      />

      <Container className="relative !px-0">
        <div className="flex flex-col gap-9 sm:gap-14">
          <div className="flex max-w-[760px] flex-col gap-4">
            <Reveal>
              <h2
                id="full-circle-titel"
                className="text-[clamp(1.9rem,5.2vw,3.4rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-pretty"
              >
                „Such dir Hilfe“ ist keine Hilfe.
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="text-lg leading-relaxed text-text-secondary text-pretty">
                Wenn ein Gespräch nicht mehr reicht, ist genau dieser Satz oft
                der Punkt, an dem Menschen aufgeben. Deshalb gibt es bei evi eine
                menschliche Ebene: einen evi Guide, der dich an die Hand nimmt —
                zum Beispiel bei der Suche nach einem Therapieplatz.
              </p>
            </Reveal>
          </div>

          <ol className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-5">
            {STEPS.map((item, index) => (
              <Reveal
                as="li"
                key={item.title}
                delay={index * 80}
                className="flex flex-col gap-2.5 rounded-[32px] border border-border bg-surface p-6 sm:p-7"
              >
                <span className="text-[0.6875rem] font-extrabold tracking-[0.08em] text-periwinkle-700 uppercase">
                  {item.step}
                </span>
                <p className="text-[clamp(1rem,1.9vw,1.25rem)] leading-[1.24] font-bold tracking-[-0.02em] text-pretty">
                  {item.title}
                </p>
                <p className="text-sm leading-relaxed text-text-secondary text-pretty">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </ol>

          <Reveal
            delay={300}
            className="flex items-center gap-4 rounded-[32px] border border-dashed border-periwinkle-300 bg-surface p-6 sm:p-7"
          >
            <Image
              src="/assets/logo-mascot.png"
              width={994}
              height={834}
              alt=""
              aria-hidden="true"
              className="size-11 shrink-0 object-contain"
            />
            <p className="text-sm leading-relaxed text-text-secondary text-pretty">
              evi Guides, langfristiges Memory und ein Erinnerungstagebuch
              gehören zu evi. Welche davon in deiner Testwelle schon offen sind,
              steht in der Einladung.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
