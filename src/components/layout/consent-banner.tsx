"use client";

import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { useAnalyticsConsent } from "@/lib/analytics/analytics-provider";

/**
 * Analytics consent.
 *
 * Shown only until a choice is made, and both choices are equally easy to
 * reach — no dark pattern where "accept" is a button and "decline" is grey
 * small print. Declining is fully functional: the page never asks again and
 * nothing is measured.
 */
export function ConsentBanner() {
  const { consent, grant, deny } = useAnalyticsConsent();

  if (consent !== "unknown") return null;

  return (
    <div
      role="region"
      aria-label="Hinweis zu Statistik-Cookies"
      className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-5"
    >
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-surface/95 p-5 shadow-2xl shadow-black/10 backdrop-blur-lg sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="text-[0.95rem] leading-relaxed text-text-tertiary">
            <p>
              <span className="font-semibold text-text-primary">
                Dürfen wir messen, wie diese Seite genutzt wird?
              </span>{" "}
              Das hilft uns zu verstehen, was verständlich ist und was nicht.
              Was du ins Formular schreibst, wird dabei nie übertragen. Mehr
              dazu in der{" "}
              <Link
                href="/datenschutz"
                className="font-medium text-link underline underline-offset-2"
              >
                Datenschutzerklärung
              </Link>
              .
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={deny}
              className={buttonStyles({
                variant: "secondary",
                className: "flex-1 sm:flex-none",
              })}
            >
              Nur Notwendiges
            </button>
            <button
              type="button"
              onClick={grant}
              className={buttonStyles({ className: "flex-1 sm:flex-none" })}
            >
              Einverstanden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
