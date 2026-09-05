import Image from "next/image";

import { Reveal } from "@/components/ui/reveal";

/** The four beats of a conversation, mirrored by the sample chat next to it. */
const STEPS = [
  { label: "Reden", body: "Der Gedanke darf erst mal raus." },
  { label: "Verstehen", body: "evi fragt nach, statt sofort zu raten." },
  { label: "Sortieren", body: "Was du weißt — und was du hineinlegst." },
  { label: "Weiterkommen", body: "Ein Schritt, den du dir zutraust." },
] as const;

/**
 * A transcript, not a feature list.
 *
 * The strongest argument for Evi is what a conversation with it actually looks
 * like, so the section shows one instead of describing it. The exchange builds
 * to the distinction the product is really about — what you know versus what
 * you are adding — and ends on a question rather than advice.
 */
const MESSAGES = [
  {
    from: "person",
    text: "Eigentlich war es nichts Großes. Warum beschäftigt mich das trotzdem noch?",
  },
  {
    from: "evi",
    text: "Lass uns kurz hinschauen. Was war der Moment, in dem es gekippt ist?",
  },
  {
    from: "person",
    text: "Sie hat nur ganz kurz geantwortet. Danach war ich den ganzen Tag daneben.",
  },
  {
    from: "evi",
    // The one place emphasis carries meaning: two words, opposed.
    text: "know-vs-assume",
  },
  {
    from: "person",
    text: "Stimmt. Ich habe das automatisch auf mich bezogen.",
  },
  {
    from: "evi-question",
    text: "Willst du erst verstehen, warum dich das so trifft — oder es direkt ansprechen?",
  },
] as const;

export function Conversation() {
  return (
    <section
      id="so-funktioniert"
      className="section-y px-5 sm:px-8"
      aria-labelledby="so-funktioniert-titel"
    >
      <div className="mx-auto flex max-w-[900px] flex-col gap-10 sm:gap-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <Reveal>
            <h2
              id="so-funktioniert-titel"
              className="text-[clamp(1.9rem,5.2vw,3.4rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-pretty"
            >
              Kein Fragebogen.
              <br />
              Ein Gespräch.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="max-w-[600px] text-lg leading-relaxed text-text-secondary text-pretty">
              Du erzählst, was dich beschäftigt. evi hört zu, fragt nach und
              hilft dir, es zu sortieren. So sieht das aus:
            </p>
          </Reveal>
        </div>

        <div className="flex flex-wrap items-start gap-8 lg:gap-14">
          <ol className="flex min-w-[200px] flex-[1_1_210px] flex-col">
            {STEPS.map((step, index) => (
              <Reveal as="li" key={step.label} delay={index * 90}>
                <div className="flex items-start gap-3.5 py-3.5">
                  <span
                    className={`flex size-[30px] shrink-0 items-center justify-center rounded-full text-[0.8125rem] font-extrabold ${
                      index === STEPS.length - 1
                        ? "text-white [background-image:var(--gradient-cta)]"
                        : "bg-pink-50 text-text-primary"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[1.1875rem] font-extrabold tracking-[-0.02em]">
                      {step.label}
                    </span>
                    <span className="text-sm leading-snug text-text-secondary text-pretty">
                      {step.body}
                    </span>
                  </span>
                </div>
                {index < STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="ml-[15px] block h-[18px] w-px bg-border"
                  />
                ) : null}
              </Reveal>
            ))}
          </ol>

          <Reveal
            delay={150}
            className="flex min-w-[280px] flex-[1.5_1_320px] flex-col overflow-hidden rounded-[40px] border border-border bg-surface shadow-md"
          >
            <div className="flex items-center gap-2.5 border-b border-border bg-bg-subtle px-4.5 py-3.5">
              <Image
                src="/assets/logo-mascot.png"
                width={994}
                height={834}
                alt=""
                aria-hidden="true"
                className="size-[26px] object-contain"
              />
              <span className="text-sm font-extrabold tracking-[-0.01em]">
                evi
              </span>
              <span className="ml-auto text-[0.6875rem] font-bold tracking-[0.08em] text-text-tertiary uppercase">
                Beispielgespräch
              </span>
            </div>

            <div className="flex flex-col gap-3 p-5 sm:p-6">
              {MESSAGES.map((message, index) => (
                <Bubble key={index} from={message.from} text={message.text} />
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="self-center">
          <p className="max-w-[540px] text-center leading-relaxed text-text-secondary text-pretty">
            Am Ende steht keine Liste mit Tipps, sondern eine klarere Frage — oder
            ein Schritt, den du dir zutraust.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Bubble({ from, text }: { from: string; text: string }) {
  if (from === "person") {
    return (
      <p className="max-w-[88%] self-end rounded-[20px_20px_6px_20px] bg-pink-50 px-4 py-3 text-[1.0625rem] font-semibold leading-snug text-pretty">
        {text}
      </p>
    );
  }

  if (from === "evi-question") {
    return (
      <p className="max-w-[92%] self-start rounded-[20px_20px_20px_6px] border border-periwinkle-200 bg-surface px-4 py-3 text-[1.0625rem] leading-relaxed text-pretty">
        {text}
      </p>
    );
  }

  if (text === "know-vs-assume") {
    return (
      <p className="max-w-[92%] self-start rounded-[20px_20px_20px_6px] bg-bg-subtle px-4 py-3 text-[1.0625rem] leading-relaxed text-pretty">
        Du <strong className="font-extrabold">weißt</strong>: sie hat kurz
        geantwortet. Du <strong className="font-extrabold">vermutest</strong>:
        sie ist genervt von dir. Das sind zwei verschiedene Dinge.
      </p>
    );
  }

  return (
    <p className="max-w-[88%] self-start rounded-[20px_20px_20px_6px] bg-bg-subtle px-4 py-3 text-[1.0625rem] leading-relaxed text-pretty">
      {text}
    </p>
  );
}
