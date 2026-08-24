import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

/**
 * What Evi is for, described as outcomes rather than features. No section
 * claims a capability that would need clinical evidence to stand behind.
 */
const PILLARS = [
  {
    title: "Gedanken sortieren",
    body: "Raum, um in eigenen Worten zu beschreiben, was gerade passiert — ohne dass du es vorher richtig benennen musst.",
    icon: "sort",
  },
  {
    title: "Belastungen besser verstehen",
    body: "Schwierige Gefühle und Situationen werden leichter einzuordnen, wenn sie eine Struktur bekommen.",
    icon: "understand",
  },
  {
    title: "Wissen, was als Nächstes helfen könnte",
    body: "Von eigener Reflexion bis zu passenden Unterstützungsformen: Evi zeigt mögliche nächste Schritte.",
    icon: "step",
  },
  {
    title: "Nicht allein weitersuchen",
    body: "Wenn menschliche oder professionelle Hilfe sinnvoll ist, hilft Evi bei der Orientierung dorthin.",
    icon: "together",
  },
] as const;

export function Pillars() {
  return (
    <section id="fuer-dich" className="section-y">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-sm font-bold tracking-[0.14em] text-link uppercase">
            Wofür Evi da ist
          </p>
          <h2 className="mt-4 text-[2.1rem] leading-[1.1] font-extrabold tracking-[-0.025em] text-balance text-text-primary sm:text-5xl">
            Vom Gefühl, dass etwas zu viel ist, zu einem klaren nächsten Schritt.
          </h2>
        </Reveal>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2">
          {PILLARS.map((pillar, index) => (
            <Reveal as="li" key={pillar.title} delay={index * 80}>
              <div className="group h-full glass rounded-[32px] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-pink-300 hover:shadow-md sm:p-8">
                {/* Icon chip in orange-50, per Design.md. */}
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-700 shadow-md">
                  <PillarIcon name={pillar.icon} />
                </span>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-text-primary">
                  {pillar.title}
                </h3>
                <p className="mt-3 leading-relaxed text-text-tertiary">
                  {pillar.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function PillarIcon({ name }: { name: (typeof PILLARS)[number]["icon"] }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "size-6",
  };

  switch (name) {
    // Scattered lines resolving into ordered ones.
    case "sort":
      return (
        <svg {...props}>
          <path d="M4 7h11" />
          <path d="M4 12h16" />
          <path d="M4 17h7" />
        </svg>
      );
    // A form becoming legible.
    case "understand":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4 4" />
        </svg>
      );
    // A path forward.
    case "step":
      return (
        <svg {...props}>
          <path d="M4 12h13" />
          <path d="M12.5 7.5L17 12l-4.5 4.5" />
        </svg>
      );
    // Two forms alongside each other.
    case "together":
      return (
        <svg {...props}>
          <circle cx="9" cy="9" r="3.2" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
          <path d="M16 6.5a3.2 3.2 0 0 1 0 6" />
          <path d="M17.5 14.5A5.5 5.5 0 0 1 20.5 19" />
        </svg>
      );
  }
}
