import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

/**
 * Boundaries are part of the product, not fine print — so they get a full,
 * full-bleed section rather than a footnote. Calm on purpose: this must
 * reassure, not alarm a visitor who is simply having a hard week.
 */
const BOUNDARIES = [
  {
    kind: "limit",
    text: "Evi ersetzt keine Psychotherapie oder medizinische Behandlung.",
  },
  {
    kind: "limit",
    text: "Evi stellt keine Diagnose.",
  },
  {
    kind: "does",
    text: "Evi soll dabei helfen, Situationen besser einzuordnen und passende nächste Schritte zu finden.",
  },
  {
    kind: "does",
    text: "Wenn professionelle oder akute Hilfe nötig ist, soll Evi nicht versuchen, sie zu ersetzen — sondern den Weg dorthin zeigen.",
  },
] as const;

export function Safety() {
  return (
    <section
      id="sicherheit"
      className="bg-gradient-brand-dark section-y text-white"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <p className="text-[0.75rem] font-bold tracking-[0.1em] text-pink-300 uppercase">
              Sicherheit &amp; Grenzen
            </p>
            <h2 className="mt-4 text-[clamp(1.875rem,4vw,3rem)] text-balance">
              Unterstützung braucht Grenzen.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/[0.72]">
              Ein digitaler Begleiter ist hilfreich, solange klar ist, was er
              kann — und was nicht. Deshalb steht das hier und nicht im
              Kleingedruckten.
            </p>
          </Reveal>

          <div>
            <ul className="space-y-3">
              {BOUNDARIES.map((item, index) => (
                <Reveal as="li" key={item.text} delay={index * 70}>
                  <div className="glass-dark flex items-start gap-4 rounded-[24px] p-5 sm:p-6">
                    <BoundaryIcon kind={item.kind} />
                    <p className="leading-relaxed text-white/90">{item.text}</p>
                  </div>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={140}>
              <div className="glass-dark mt-6 rounded-[24px] p-5 sm:p-6">
                <p className="text-[0.9375rem] leading-relaxed text-white/[0.72]">
                  Wenn es dir gerade akut schlecht geht oder du in unmittelbarer
                  Gefahr bist, ist Evi nicht die richtige Hilfe.
                </p>
                <Link
                  href="/akute-hilfe"
                  className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-white underline underline-offset-4 hover:no-underline"
                >
                  Wege zu akuter Hilfe
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

function BoundaryIcon({ kind }: { kind: "limit" | "does" }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "size-4",
  };

  /*
    Design.md alternates pink-300 and orange-300 for icons on this surface;
    both clear 3:1 against it (7.6:1 and 8.0:1). Never red — this is a
    boundary, not a warning.
  */
  return (
    <span
      className={`mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 ${
        kind === "limit" ? "text-orange-300" : "text-pink-300"
      }`}
    >
      {kind === "limit" ? (
        <svg {...props}>
          <path d="M5 12h14" />
        </svg>
      ) : (
        <svg {...props}>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      )}
    </span>
  );
}
