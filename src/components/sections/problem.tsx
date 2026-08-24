import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const SIGNS = [
  "Stress",
  "innere Unruhe",
  "Überforderung",
  "Einsamkeit",
  "Druck",
  "kreisende Gedanken",
  "Unsicherheit",
];

const QUESTIONS = [
  {
    question: "Was passiert da gerade?",
    answer:
      "Vieles lässt sich am Anfang schwer benennen. Das heißt nicht, dass es unwichtig ist.",
  },
  {
    question: "Was kann ich selbst tun?",
    answer:
      "Manchmal hilft schon, das Durcheinander im Kopf einmal zu ordnen.",
  },
  {
    question: "Wann sollte ich mit jemandem sprechen?",
    answer:
      "Es gibt keinen festen Punkt, ab dem es „schlimm genug“ ist. Orientierung darf früher beginnen.",
  },
];

export function Problem() {
  return (
    <section id="was-ist-evi" className="bg-bg-subtle section-y">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <Reveal>
            <h2 className="text-[2.1rem] leading-[1.1] font-extrabold tracking-[-0.025em] text-balance text-text-primary sm:text-5xl">
              Nicht jede Belastung beginnt als Krise.
            </h2>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-tertiary">
              Meistens beginnt sie viel leiser — und lange bevor jemand
              professionelle Hilfe sucht.
            </p>

            <ul className="mt-8 flex flex-wrap gap-2">
              {SIGNS.map((sign) => (
                <li
                  key={sign}
                  className="rounded-full border border-border bg-surface px-4 py-2 text-[0.95rem] text-text-tertiary"
                >
                  {sign}
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="space-y-4">
            {QUESTIONS.map((item, index) => (
              <Reveal key={item.question} delay={index * 90}>
                <div className="glass rounded-[32px] p-6 transition-shadow hover:shadow-lg hover:shadow-black/5 sm:p-7">
                  <h3 className="text-xl font-bold tracking-tight text-text-primary">
                    {item.question}
                  </h3>
                  <p className="mt-2 leading-relaxed text-text-tertiary">
                    {item.answer}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal>
          <p className="mt-14 max-w-2xl border-l-2 border-accent pl-6 text-xl leading-relaxed font-medium text-balance text-text-primary sm:text-2xl">
            Evi ist dafür gedacht, dass du früher Orientierung findest — damit
            du nicht erst suchst, wenn alles zu viel wird.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
