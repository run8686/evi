import Link from "next/link";

import { Container } from "@/components/ui/container";
import { ACUTE_HELP_RESOURCES } from "@/lib/constants";

/**
 * The crisis strip, on the page itself rather than only behind a link.
 *
 * Numbers come from ACUTE_HELP_RESOURCES, which is the single verified source
 * shared with /akute-hilfe — a number that exists in two places will eventually
 * disagree with itself. The numbers are real tel: links: someone reading this
 * on a phone should be one tap from a call, not from a copy-paste.
 */
export function AcuteHelp() {
  return (
    <section
      id="akuthilfe"
      className="bg-bg-subtle px-5 py-14 sm:px-8 sm:py-20"
      aria-labelledby="akuthilfe-titel"
    >
      <Container width="narrow" className="!px-0">
        <div className="flex flex-col gap-5">
          <h2
            id="akuthilfe-titel"
            className="text-[clamp(1.375rem,3.4vw,2rem)] leading-[1.14] font-extrabold tracking-[-0.035em] text-pretty"
          >
            Wenn es gerade akut ist.
          </h2>
          <p className="leading-relaxed text-text-secondary text-pretty">
            evi ist nicht für Krisen gedacht. Wenn du oder jemand anderes gerade
            in einer akuten Notlage ist, wende dich bitte direkt an Menschen, die
            sofort helfen können.
          </p>

          <ul className="grid gap-3.5 sm:grid-cols-3">
            {ACUTE_HELP_RESOURCES.map((resource, index) => {
              const label = (
                <>
                  <span className="text-sm text-text-secondary">
                    {resource.name}
                    {resource.availability ? `, ${resource.availability}` : ""}
                  </span>
                  <span className="text-[clamp(1.25rem,2.4vw,1.625rem)] font-extrabold tracking-[-0.03em]">
                    {resource.phone ?? resource.href}
                  </span>
                </>
              );

              return (
                <li
                  key={`${resource.name}-${index}`}
                  className="rounded-[32px] border border-border bg-surface"
                >
                  {/* phone is optional on the type — never render tel:undefined. */}
                  {resource.phone ? (
                    <a
                      href={`tel:${resource.phone.replace(/\s/g, "")}`}
                      className="flex min-h-24 flex-col justify-center gap-1 px-5 py-4 [transition:background_var(--duration-base)_var(--ease-standard)] hover:bg-bg-subtle"
                    >
                      {label}
                    </a>
                  ) : (
                    <div className="flex min-h-24 flex-col justify-center gap-1 px-5 py-4">
                      {label}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="text-sm text-text-secondary">
            Mehr Anlaufstellen und was du erwarten kannst:{" "}
            <Link
              href="/akute-hilfe"
              className="font-bold text-link underline underline-offset-2"
            >
              Akute Hilfe
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
