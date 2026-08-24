import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const STEPS = [
  {
    number: "01",
    title: "Einordnen",
    body: "Beschreibe, was dich gerade beschäftigt — in deinen eigenen Worten, ohne Fragebogen.",
  },
  {
    number: "02",
    title: "Verstehen",
    body: "Evi hilft dir, Gedanken, Situationen und Belastungen verständlicher zu strukturieren.",
  },
  {
    number: "03",
    title: "Nächsten Schritt finden",
    body: "Von eigener Reflexion bis zu passenden Unterstützungsangeboten: Evi hilft bei der Orientierung.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-bg-subtle section-y">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-sm font-bold tracking-[0.14em] text-link uppercase">
            So funktioniert es
          </p>
          <h2 className="mt-4 text-[2.1rem] leading-[1.1] font-extrabold tracking-[-0.025em] text-balance text-text-primary sm:text-5xl">
            Drei Schritte. Kein Formular, keine Diagnose.
          </h2>
        </Reveal>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal as="li" key={step.number} delay={index * 100}>
              <div className="h-full rounded-[32px] border border-white/70 bg-surface/80 p-7 backdrop-blur-sm sm:p-8">
                <span
                  aria-hidden="true"
                  className="text-orange-600 block text-5xl font-extrabold tracking-tight tabular-nums sm:text-6xl"
                >
                  {step.number}
                </span>
                <h3 className="mt-4 text-xl font-bold tracking-tight text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-text-tertiary">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
