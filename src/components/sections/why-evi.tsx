import Image from "next/image";

import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

/**
 * Four opening lines, four products. The comparison is made by quoting the
 * first question each one asks — which is a fairer test than a feature table,
 * and it lets the alternatives keep their dignity: all four are useful, they
 * just solve different things.
 */
const OPENERS = [
  {
    quote: "„Was möchtest du heute wissen?“",
    label: "Allgemeiner KI-Chat",
    body: "Kann fast alles ein bisschen. Für sensible persönliche Gespräche ist er aber nicht gebaut — und übernimmt dafür auch keine Verantwortung.",
  },
  {
    quote: "„Wie fühlst du dich heute? 1–5“",
    label: "Mood-Tracker",
    body: "Sammelt Daten über dich und zeigt sie dir als Kurve. Aber niemand redet mit dir über das, was hinter der Kurve steht.",
  },
  {
    quote: "„Starte deine 10-Minuten-Übung.“",
    label: "Meditations- und Kurs-Apps",
    body: "Gut, um runterzukommen. Sie beantworten aber nicht die Frage, warum dich gerade genau diese Sache nicht loslässt.",
  },
] as const;

const DIFFERENCES = [
  {
    title: "Ein enger, verantworteter Einsatzbereich",
    body: "evi ist kein Allzweck-Assistent. Es ist für persönliche Gespräche entwickelt — und sagt, wo es nicht zuständig ist.",
  },
  {
    title: "Gespräch statt schneller Lösung",
    body: "evi versteht und fragt nach, statt sofort eine Antwortliste zu produzieren.",
  },
  {
    title: "Grenzen sind Teil des Produkts",
    body: "Was evi nicht tut, ist fachlich mitentwickelt — nicht nachträglich ins Kleingedruckte geschrieben.",
  },
  {
    title: "Menschen bleiben wichtiger",
    body: "Ein gutes Ergebnis kann sein, das Handy weglegen und mit jemandem reden. evi ermutigt dazu.",
  },
] as const;

export function WhyEvi() {
  return (
    <section
      id="warum-evi"
      className="section-y bg-bg-subtle px-5 sm:px-8"
      aria-labelledby="warum-evi-titel"
    >
      <Container className="!px-0">
        <div className="flex flex-col gap-10 sm:gap-16">
          <div className="flex max-w-[720px] flex-col gap-4">
            <Reveal>
              <h2
                id="warum-evi-titel"
                className="text-[clamp(1.9rem,5.2vw,3.4rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-pretty"
              >
                Die erste Frage entscheidet alles.
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="text-lg leading-relaxed text-text-secondary text-pretty">
                Womit eine App dich zuerst begrüßt, verrät, wofür sie gebaut ist.
                Alle vier sind sinnvoll — aber sie lösen unterschiedliche Dinge.
              </p>
            </Reveal>
          </div>

          <ul className="flex flex-col gap-3 sm:gap-4">
            {OPENERS.map((opener, index) => (
              <Reveal as="li" key={opener.label} delay={index * 100}>
                <div className="flex flex-wrap items-baseline gap-4 rounded-[40px] border border-border bg-surface p-6 sm:gap-10 sm:p-8">
                  <p className="min-w-[240px] flex-[1_1_300px] text-[clamp(1.1875rem,2.6vw,1.6875rem)] leading-tight font-extrabold tracking-[-0.03em] text-text-tertiary text-pretty">
                    {opener.quote}
                  </p>
                  <div className="flex flex-[1_1_220px] flex-col gap-1.5">
                    <span className="text-[0.6875rem] font-extrabold tracking-[0.08em] text-text-tertiary uppercase">
                      {opener.label}
                    </span>
                    <span className="text-sm leading-relaxed text-text-secondary text-pretty">
                      {opener.body}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}

            {/* Evi's own line, last and elevated — the answer to the three above. */}
            <Reveal as="li" delay={340}>
              <div className="flex flex-wrap items-baseline gap-4 rounded-[40px] border border-periwinkle-200 bg-surface p-7 shadow-md sm:gap-10 sm:p-9">
                <p className="min-w-[240px] flex-[1_1_300px] text-[clamp(1.3125rem,2.9vw,1.9375rem)] leading-[1.18] font-extrabold tracking-[-0.03em] text-pretty">
                  „Was beschäftigt dich gerade?“
                </p>
                <div className="flex flex-[1_1_220px] flex-col gap-1.5">
                  <span className="flex items-center gap-2 text-[0.6875rem] font-extrabold tracking-[0.08em] text-periwinkle-700 uppercase">
                    <Image
                      src="/assets/logo-mascot.png"
                      width={994}
                      height={834}
                      alt=""
                      aria-hidden="true"
                      className="size-[17px] object-contain"
                    />
                    evi
                  </span>
                  <span className="text-sm leading-relaxed text-text-secondary text-pretty">
                    Ein Gespräch über deine konkrete Situation — mit
                    Psycholog:innen mitentwickelt, mit klaren Grenzen und mit dem
                    Ziel, dich weiterzubringen statt zu beschäftigen.
                  </span>
                </div>
              </div>
            </Reveal>
          </ul>

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-9 lg:grid-cols-4">
            {DIFFERENCES.map((difference, index) => (
              <Reveal
                key={difference.title}
                delay={index * 90}
                className="flex flex-col gap-2.5 border-t-2 border-periwinkle-200 pt-5"
              >
                <h3 className="text-[1.3125rem] leading-tight font-extrabold tracking-[-0.025em] text-pretty">
                  {difference.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary text-pretty">
                  {difference.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
