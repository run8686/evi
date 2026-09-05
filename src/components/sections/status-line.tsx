import { Container } from "@/components/ui/container";

/**
 * The one honest status claim on the page, directly under the hero: Evi is not
 * finished. Saying it here means nobody has to discover it at the signup form.
 */
export function StatusLine() {
  return (
    <Container className="flex justify-center pt-5">
      <p className="flex items-center gap-2.5 rounded-full border border-border bg-bg-subtle px-4 py-2.5 text-center text-[0.8125rem] font-semibold text-text-secondary text-pretty">
        <span
          aria-hidden="true"
          className="size-[7px] shrink-0 rounded-full bg-orange-600 motion-safe:animate-breathe"
        />
        Mitten in der Entwicklung. Der Zugang startet in kleinen Wellen — Early
        Access ist ab jetzt möglich.
      </p>
    </Container>
  );
}
