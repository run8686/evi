import { Mascot } from "@/components/brand/logo";
import { SocialLinks } from "@/components/layout/social-links";

/**
 * Confirmation after a stored signup.
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
        Du bist dabei. <span aria-hidden="true">💙</span>
      </h3>

      <p className="mx-auto mt-4 max-w-md text-[1.05rem] leading-relaxed text-text-tertiary">
        Wir öffnen Evi schrittweise für erste Tester:innen. Sobald dein Zugang
        bereit ist, melden wir uns bei dir.
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
