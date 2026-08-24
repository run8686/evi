import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

/**
 * Privacy principles.
 *
 * Every line here describes something this page actually does, and can be
 * checked in the code. There are deliberately no certifications, no compliance
 * badges and no encryption promises — those need audits, not copywriting.
 */
const PRINCIPLES = [
  {
    title: "So wenig Daten wie möglich",
    body: "Für die Warteliste brauchen wir deine E-Mail-Adresse. Dein Vorname ist optional — mehr fragen wir nicht.",
  },
  {
    title: "Keine Gesundheitsdaten",
    body: "Wir fragen dich hier nichts zu Diagnosen, Symptomen, Medikamenten oder Therapie. Das gehört nicht in eine Warteliste.",
  },
  {
    title: "Statistik nur mit Zustimmung",
    body: "Ohne dein Einverständnis wird nichts gemessen. Und was du ins Formular schreibst, wird nie an die Statistik übertragen.",
  },
  {
    title: "Grenzen gehören ins Produkt",
    body: "Was Evi nicht kann, sagen wir auf dieser Seite — nicht erst in den Nutzungsbedingungen.",
  },
];

export function Trust() {
  return (
    <section className="bg-bg-subtle section-y">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <p className="text-sm font-bold tracking-[0.14em] text-link uppercase">
              Vertrauen & Privatsphäre
            </p>
            <h2 className="mt-4 text-[2.1rem] leading-[1.1] font-extrabold tracking-[-0.025em] text-balance text-text-primary sm:text-5xl">
              Vertrauen entsteht durch Entscheidungen, nicht durch Versprechen.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-text-tertiary">
              Evi entsteht in einem sensiblen Bereich. Deshalb sagen wir lieber,
              was wir konkret tun, als mit Siegeln zu werben.
            </p>
            <Link
              href="/datenschutz"
              className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-link underline-offset-4 hover:underline"
            >
              Zur Datenschutzerklärung
              <span aria-hidden="true">→</span>
            </Link>
          </Reveal>

          <ul className="grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <Reveal as="li" key={principle.title} delay={index * 80}>
                <div className="h-full glass rounded-[32px] p-6 sm:p-7">
                  <h3 className="text-lg font-bold tracking-tight text-text-primary">
                    {principle.title}
                  </h3>
                  <p className="mt-2.5 text-[0.97rem] leading-relaxed text-text-tertiary">
                    {principle.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
