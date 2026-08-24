"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";

import { WaitlistSuccess } from "@/components/waitlist/waitlist-success";
import { buttonStyles } from "@/components/ui/button";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics/events";
import {
  attributionFormFields,
  getAttribution,
  getAttributionServerSnapshot,
  subscribeAttribution,
} from "@/lib/utm";
import { joinWaitlist } from "@/lib/waitlist/actions";
import { WAITLIST_INITIAL_STATE } from "@/lib/waitlist/state";

/**
 * Early Access signup.
 *
 * Collects the minimum needed to send an invitation: an e-mail address, and
 * optionally a first name so the mail can say hello properly. It deliberately
 * asks nothing about diagnoses, symptoms, medication, therapy history or how
 * anyone is feeling — none of that belongs in a waitlist.
 */
export function WaitlistForm() {
  const [state, formAction, pending] = useActionState(
    joinWaitlist,
    WAITLIST_INITIAL_STATE,
  );
  // Attribution comes from the URL the person arrived on, so it can only be
  // read on the client. It travels with the form as hidden fields, which keeps
  // the form working even if the page's JavaScript never loads.
  const attribution = useSyncExternalStore(
    subscribeAttribution,
    getAttribution,
    getAttributionServerSnapshot,
  );
  const startedRef = useRef(false);
  const errorRef = useRef<HTMLParagraphElement | null>(null);

  // One funnel event per outcome.
  useEffect(() => {
    if (state.status === "success") {
      void track(ANALYTICS_EVENTS.waitlistSubmitSuccess);
    } else if (state.status === "error") {
      void track(ANALYTICS_EVENTS.waitlistSubmitError, { reason: state.code });
      // Move focus to the message so it is not missed on submit.
      errorRef.current?.focus();
    }
  }, [state]);

  const onFirstInteraction = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    void track(ANALYTICS_EVENTS.waitlistFormStart);
  };

  if (state.status === "success") {
    return <WaitlistSuccess />;
  }

  const emailInvalid = state.status === "error" && state.code === "invalid_email";
  const hiddenFields = attributionFormFields(attribution);

  return (
    <form action={formAction} className="text-left" noValidate={false}>
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      {/*
        Honeypot. Off-screen rather than display:none (which some bots detect),
        removed from the tab order and hidden from assistive tech, so no real
        visitor can reach it.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] size-px overflow-hidden"
      >
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Required field first, so it is obvious how little we actually ask for. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-text-primary">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            onFocus={onFirstInteraction}
            disabled={pending}
            placeholder="du@beispiel.de"
            aria-invalid={emailInvalid || undefined}
            aria-describedby={
              state.status === "error" ? "waitlist-error" : undefined
            }
            className={`mt-2 min-h-12 w-full rounded-2xl border bg-surface px-4 text-base text-text-primary placeholder:text-text-secondary focus:outline-none disabled:opacity-60 ${
              emailInvalid
                ? "border-danger focus:border-danger"
                : "border-border focus:border-accent"
            }`}
          />
        </div>

        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-semibold text-text-primary"
          >
            Vorname{" "}
            <span className="font-normal text-text-secondary">(optional)</span>
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            autoComplete="given-name"
            maxLength={80}
            onFocus={onFirstInteraction}
            disabled={pending}
            placeholder="Dein Vorname"
            className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-surface px-4 text-base text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none disabled:opacity-60"
          />
        </div>
      </div>

      {/*
        Marketing consent is separate from the Early-Access mail people are
        signing up for, and is never pre-selected.
      */}
      <div className="mt-5 flex items-start gap-3">
        <input
          id="marketing_consent"
          name="marketing_consent"
          type="checkbox"
          disabled={pending}
          // 24px so the box itself meets the WCAG 2.2 target-size minimum,
          // not only the label next to it.
          className="mt-0.5 size-6 shrink-0 rounded-md border-border text-accent accent-accent"
        />
        <label
          htmlFor="marketing_consent"
          className="text-sm leading-relaxed text-text-tertiary"
        >
          Ich möchte zusätzlich gelegentlich Neuigkeiten zur Entwicklung von Evi
          erhalten. (optional, jederzeit widerrufbar)
        </label>
      </div>

      {state.status === "error" ? (
        <p
          id="waitlist-error"
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mt-5 rounded-2xl border border-danger/40 bg-danger-bg px-4 py-3 text-[0.95rem] text-text-primary"
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={buttonStyles({ size: "lg", className: "mt-6 w-full" })}
      >
        {pending ? (
          <>
            <Spinner />
            Wird gesendet …
          </>
        ) : (
          "Early Access sichern"
        )}
      </button>

      <p className="mt-4 text-sm leading-relaxed text-text-secondary">
        Kein Spam. Nur relevante Informationen zu deinem Evi Early Access. Wie
        wir mit deinen Daten umgehen, steht in der{" "}
        <Link
          href="/datenschutz"
          className="font-medium text-link underline underline-offset-2"
        >
          Datenschutzerklärung
        </Link>
        .
      </p>
    </form>
  );
}

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4 animate-spin"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
