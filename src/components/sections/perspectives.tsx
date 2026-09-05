import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const SELF = [
  "Was passiert gerade mit mir?",
  "Warum reagiere ich so?",
  "Wie spreche ich darüber?",
  "Was brauche ich eigentlich?",
] as const;

const OTHERS = [
  "Warum zieht sie sich zurück?",
  "Wie spreche ich das an?",
  "Wie kann ich helfen, ohne zu drängen?",
  "Wo liegen meine eigenen Grenzen?",
] as const;

/**
 * The two-audience split — for yourself, or for someone you care about.
 *
 * It is a structural copy pattern across the whole page, and this is the one
 * section where it is the subject. The second card carries the boundary that
 * makes it defensible: Evi does not assess people who are not in the room.
 */
export function Perspectives() {
  return (
    <section className="section-y px-5 sm:px-8" aria-labelledby="perspektiven-titel">
      <Container className="!px-0">
        <div className="flex flex-col gap-9 sm:gap-14">
          <div className="flex max-w-[700px] flex-col gap-4">
            <Reveal>
              <h2
                id="perspektiven-titel"
                className="text-[clamp(1.9rem,5.2vw,3.4rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-pretty"
              >
                Für dich. Oder für den Menschen, um den du dir Sorgen machst.
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="text-lg leading-relaxed text-text-secondary text-pretty">
                Beides ist ein guter Grund, mit evi zu reden.
              </p>
            </Reveal>
          </div>

          <div className="grid items-start gap-4 sm:gap-7 md:grid-cols-2">
            <Reveal
              delay={200}
              className="flex flex-col gap-5 rounded-[40px] bg-pink-50 p-7 sm:p-10"
            >
              <h3 className="text-[clamp(1.375rem,3.4vw,2rem)] leading-[1.14] font-extrabold tracking-[-0.035em]">
                Wenn es um dich geht.
              </h3>
              <ul className="flex flex-col gap-3">
                {SELF.map((question) => (
                  <li
                    key={question}
                    className="rounded-[20px_20px_20px_6px] bg-surface px-4.5 py-3.5 text-[1.0625rem] leading-snug font-semibold text-pretty sm:text-lg"
                  >
                    {question}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal
              delay={300}
              className="flex flex-col gap-5 rounded-[40px] border border-periwinkle-200 bg-periwinkle-50 p-7 sm:p-10"
            >
              <h3 className="text-[clamp(1.375rem,3.4vw,2rem)] leading-[1.14] font-extrabold tracking-[-0.035em]">
                Wenn es um jemanden geht, der dir wichtig ist.
              </h3>
              <ul className="flex flex-col gap-3">
                {OTHERS.map((question) => (
                  <li
                    key={question}
                    className="rounded-[20px_20px_20px_6px] bg-surface px-4.5 py-3.5 text-[1.0625rem] leading-snug font-semibold text-pretty sm:text-lg"
                  >
                    {question}
                  </li>
                ))}
              </ul>
              <p className="text-sm leading-relaxed text-text-secondary text-pretty">
                evi beurteilt keine Menschen, die nicht am Gespräch beteiligt
                sind. Es hilft dir, deine Beobachtungen, deine Reaktion und
                mögliche nächste Schritte zu sortieren.
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
