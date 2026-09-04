import { Mascot } from "@/components/brand/logo";
import { SocialLinks } from "@/components/layout/social-links";

/**
 * Shown after the form was submitted successfully.
 *
 * Careful with the wording: at this point the person is NOT on the list yet.
 * A confirmation mail is on its way and the signup only counts once they
 * click the button in it. Saying "you're in" here would be the same kind of
 * false success as showing this screen for a signup that was never stored.
 *
 * States what actually happens next and nothing more: no date, no queue
 * position, no prototype link, no invented signup count.
 */
export function WaitlistSuccess() {
  return (
    <div
      className="text-center"
      // Announced to screen readers the moment the form is replaced.
      role="status"
      aria-live="polite"
    >
      <Mascot className="mx-auto h-20 w-auto motion-safe:animate-float" />

      <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
        Schau in dein Postfach. <span aria-hidden="true">💌</span>
      </h3>

      <p className="mx-auto mt-4 max-w-md text-[1.05rem] leading-relaxed text-text-tertiary">
        Wir haben dir eine E-Mail geschickt. Ein Klick auf den Button darin
        bestätigt deinen Platz — danach melden wir uns, sobald ein Platz für
        dich frei ist.
      </p>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
        Nichts angekommen? Schau kurz im Spam-Ordner nach.
      </p>

      <div className="mt-8 border-t border-border pt-6">
        <p className="text-sm text-text-secondary">
          Bis dahin kannst du Evi hier begleiten:
        </p>
        <SocialLinks showLabels className="mt-3 justify-center" />
      </div>
    </div>
  );
}
