import { WaitlistForm } from "@/components/waitlist/waitlist-form";
import { ViewTracker } from "@/components/ui/view-tracker";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

const EXPECTATIONS = [
  "evi ist mitten in der Entwicklung — deine Anmeldung wird nicht sofort freigeschaltet.",
  "Der Zugang erfolgt schrittweise in kleinen Testwellen.",
  "Für Endnutzer bleibt evi dauerhaft kostenlos.",
  "Du kannst dich jederzeit mit einer kurzen Nachricht wieder austragen.",
] as const;

/**
 * The signup, and the last section before the FAQ.
 *
 * The form itself is unchanged: it keeps the Server Action, the honeypot, the
 * attribution fields and the double-opt-in flow — only the surface around it
 * is new. What is promised here has to match what the rest of the page said,
 * so the four expectations are listed under the form rather than in a modal.
 */
export function EarlyAccess() {
  return (
    <section
      id="early-access"
      className="section-y relative overflow-hidden px-5 sm:px-8"
      aria-labelledby="early-access-titel"
    >
      <ViewTracker event={ANALYTICS_EVENTS.earlyAccessSectionView} />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[100px] left-1/2 h-[340px] w-[600px] -translate-x-1/2 rounded-full opacity-12 blur-[90px] [background-image:var(--gradient-brand)] motion-safe:animate-blob"
      />

      <div className="relative mx-auto flex max-w-[620px] flex-col items-center gap-5 text-center">
        <h2
          id="early-access-titel"
          className="text-[clamp(1.9rem,5.2vw,3.4rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-pretty"
        >
          Sei unter den Ersten, die mit evi reden.
        </h2>
        <p className="text-lg leading-relaxed text-text-secondary text-pretty">
          Der Zugang öffnet in kleinen Wellen — eine E-Mail genügt, um dabei zu
          sein.
        </p>

        <div className="glass mt-1.5 w-full rounded-[32px] p-6 sm:p-8">
          <WaitlistForm />
        </div>

        <ul className="flex w-full max-w-[520px] flex-col gap-2.5 text-left">
          {EXPECTATIONS.map((item) => (
            <li
              key={item}
              className="flex gap-2.5 text-sm leading-relaxed text-text-secondary"
            >
              <span aria-hidden="true" className="font-extrabold text-periwinkle-700">
                –
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
