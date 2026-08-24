import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

/**
 * The secondary audience: people worried about someone else. Important enough
 * to name explicitly, deliberately kept smaller than the primary journey.
 */
export function ForOthers() {
  return (
    <section className="section-y">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface p-8 sm:p-12 lg:p-14">
            {/* Warm cream wash, drawn from the mascot's eye ring. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-cream-300 opacity-60 blur-3xl"
            />

            <div className="relative max-w-2xl">
              <p className="text-sm font-bold tracking-[0.14em] text-link uppercase">
                Auch dafür gedacht
              </p>
              <h2 className="mt-4 text-[1.9rem] leading-[1.12] font-extrabold tracking-[-0.02em] text-balance text-text-primary sm:text-4xl">
                Wenn es nicht um dich geht.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-text-tertiary">
                Manchmal merkst du, dass es jemandem in deinem Umfeld nicht gut
                geht – und weißt trotzdem nicht, was du sagen oder tun sollst.
                Evi soll auch dabei helfen, Situationen besser einzuordnen und
                einen verantwortungsvollen nächsten Schritt zu finden.
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
