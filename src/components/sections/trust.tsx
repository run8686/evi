import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const LIMITS = [
  {
    title: "evi ist keine Therapie.",
    body: "Keine Diagnose. Kein Arzt. Kein Krisendienst. evi hilft beim Verstehen und Sortieren — und sagt dir, wenn etwas anderes gerade wichtiger ist.",
  },
  {
    title: "Deine Gespräche sind kein Geschäftsmodell.",
    body: "Persönliche Gesprächs- und Gesundheitsdaten werden nicht verkauft, nicht für Werbeprofile genutzt und nicht zum Training allgemeiner KI-Modelle monetarisiert.",
  },
  {
    title: "Fachlich mitentwickelt.",
    body: "evi entsteht nicht allein am Rechner. Psycholog:innen entwickeln mit und begleiten, wie evi in Gesprächen reagiert — besonders dort, wo es sensibel wird.",
  },
] as const;

/**
 * The dark section, and the only one on the page.
 *
 * It carries the limits rather than the promises, which is why it gets the
 * strongest surface treatment: what Evi will not do is the most important
 * thing on a mental-health page, so it is not allowed to look like fine print.
 *
 * Text on this ground is full-opacity white or white/78 — never a muted tint
 * below AA. --gradient-brand-dark is the specified surface.
 */
export function Trust() {
  return (
    <section
      id="vertrauen"
      className="section-y px-5 text-white [background-image:var(--gradient-brand-dark)] sm:px-8"
      aria-labelledby="vertrauen-titel"
    >
      <Container className="!px-0">
        <div className="flex flex-col gap-10 sm:gap-16">
          <div className="flex max-w-[740px] flex-col gap-4">
            <Reveal>
              <h2
                id="vertrauen-titel"
                className="text-[clamp(1.9rem,5.2vw,3.4rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-white text-pretty"
              >
                Keine Siegel. Nur klare Grenzen.
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="text-lg leading-relaxed text-white/78 text-pretty">
                Du solltest wissen, worauf du dich einlässt. Deshalb stehen hier
                konkrete Zusagen — und Ehrlichkeit darüber, wo wir stehen.
              </p>
            </Reveal>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 sm:gap-9">
            {LIMITS.map((limit, index) => (
              <Reveal
                key={limit.title}
                delay={index * 120}
                className="flex flex-col gap-3 border-t-2 border-white/28 pt-5"
              >
                <h3 className="text-[clamp(1.25rem,2.4vw,1.625rem)] leading-[1.16] font-extrabold tracking-[-0.03em] text-white">
                  {limit.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/78 text-pretty">
                  {limit.body}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={220} className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <div className="flex flex-col gap-3.5 rounded-[40px] border border-white/16 bg-white/7 p-7 sm:p-8">
              <span className="text-[0.6875rem] font-extrabold tracking-[0.08em] text-white/60 uppercase">
                Was evi weiß
              </span>
              <p className="text-[clamp(1.0625rem,2vw,1.3125rem)] leading-[1.3] font-bold tracking-[-0.02em] text-white text-pretty">
                Was du erzählst — damit das Gespräch dir hilft.
              </p>
            </div>
            <div className="flex flex-col gap-3.5 rounded-[40px] border border-white/16 bg-white/7 p-7 sm:p-8">
              <span className="text-[0.6875rem] font-extrabold tracking-[0.08em] text-white/60 uppercase">
                Was andere sehen
              </span>
              <p className="text-[clamp(1.0625rem,2vw,1.3125rem)] leading-[1.3] font-bold tracking-[-0.02em] text-white text-pretty">
                Nichts davon. Keine einzelnen Chats, keine persönlichen Inhalte.
              </p>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <p className="max-w-[680px] text-sm leading-relaxed text-white/70 text-pretty">
              Wir versprechen hier keine technischen Zusicherungen, die wir noch
              nicht belegen können. Das Safety-Framework mit klaren
              Eskalationsstufen entwickeln wir gemeinsam mit Psycholog:innen
              weiter.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
