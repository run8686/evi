import { Container } from "@/components/ui/container";
import { FAQ_GROUPS } from "@/lib/content/faq";
import { SOCIAL, SUPPORT_EMAIL } from "@/lib/constants";

/**
 * Native <details>/<summary> rather than a JS accordion: it opens without
 * JavaScript, it is searchable by the browser's find-in-page, and screen
 * readers already know what it is. The marker is replaced by our own chevron.
 */
export function Faq() {
  return (
    <section className="section-y px-5 sm:px-8" id="faq" aria-labelledby="faq-titel">
      <Container width="narrow" className="!px-0">
        <div className="flex flex-col gap-9 sm:gap-13">
          <div className="flex flex-col gap-3.5">
            <h2
              id="faq-titel"
              className="text-[clamp(1.9rem,5.2vw,3.4rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-pretty"
            >
              Noch eine konkrete Frage?
            </h2>
            <p className="text-lg leading-relaxed text-text-secondary text-pretty">
              Hier steht auch das, was wir noch nicht zusagen können.
            </p>
          </div>

          {FAQ_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-4">
              <h3 className="text-[clamp(1.125rem,2.1vw,1.375rem)] font-extrabold tracking-[-0.025em] text-periwinkle-700">
                {group.title}
              </h3>
              <div className="flex flex-col">
                {group.items.map((item) => (
                  <details
                    key={item.question}
                    className="group border-b border-border"
                  >
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3.5 text-[1.0625rem] font-bold tracking-[-0.015em] text-pretty [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-text-tertiary [transition:transform_var(--duration-base)_var(--ease-standard)] group-open:rotate-180"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-5"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </span>
                    </summary>
                    <p className="pb-4 leading-relaxed text-text-secondary text-pretty">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-3 rounded-[40px] bg-bg-subtle p-7 sm:p-8">
            <p className="text-[1.3125rem] font-extrabold tracking-[-0.025em]">
              Deine Frage steht nicht dabei?
            </p>
            <p className="leading-relaxed text-text-secondary text-pretty">
              Schreib uns per Instagram-DM an{" "}
              <a
                href={SOCIAL.instagram}
                target="_blank"
                rel="noopener"
                className="font-bold text-link underline underline-offset-2"
              >
                @evi.mental
              </a>{" "}
              oder per Mail an{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-bold text-link underline underline-offset-2"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
