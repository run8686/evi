"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  getConsentServerSnapshot,
  getConsentSnapshot,
  setConsent,
  subscribeConsent,
  type ConsentState,
} from "./consent";
import { ANALYTICS_EVENTS, track } from "./events";
import { captureAttribution } from "@/lib/utm";

type AnalyticsContextValue = {
  consent: ConsentState;
  grant: () => void;
  deny: () => void;
};

const AnalyticsContext = createContext<AnalyticsContextValue>({
  consent: "unknown",
  grant: () => {},
  deny: () => {},
});

export function useAnalyticsConsent(): AnalyticsContextValue {
  return useContext(AnalyticsContext);
}

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

let initStarted = false;

/**
 * Loads and configures PostHog. Runs at most once, and only with consent.
 *
 * The configuration is deliberately restrictive for a mental-health context:
 * no autocapture (which would record the text of clicked elements) and no
 * session recording (which would record everything typed). Combined with the
 * property allowlist in events.ts, only the explicit funnel events are sent.
 */
async function initPostHog(): Promise<void> {
  if (initStarted || !POSTHOG_KEY) return;
  initStarted = true;

  try {
    const { default: posthog } = await import("posthog-js");
    if (posthog.__loaded) return;

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      autocapture: false,
      disable_session_recording: true,
      disable_surveys: true,
      capture_pageview: false,
      capture_pageleave: true,
      person_profiles: "identified_only",
      persistence: "localStorage+cookie",
    });

    const attribution = captureAttribution();
    void track(ANALYTICS_EVENTS.landingPageView, {
      utm_source: attribution.utmSource ?? undefined,
      utm_medium: attribution.utmMedium ?? undefined,
      utm_campaign: attribution.utmCampaign ?? undefined,
      utm_content: attribution.utmContent ?? undefined,
      utm_term: attribution.utmTerm ?? undefined,
      referrer: attribution.referrer ?? undefined,
    });
  } catch {
    initStarted = false;
  }
}

async function stopPostHog(): Promise<void> {
  try {
    const { default: posthog } = await import("posthog-js");
    if (!posthog.__loaded) return;
    posthog.opt_out_capturing();
    posthog.reset(true);
  } catch {
    // Nothing loaded, nothing to clean up.
  }
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );

  useEffect(() => {
    // Attribution is captured regardless of consent: it stays in this
    // browser's sessionStorage and only leaves the device attached to a form
    // the person actively submits.
    captureAttribution();

    if (consent === "granted") void initPostHog();
  }, [consent]);

  const grant = useCallback(() => setConsent("granted"), []);
  const deny = useCallback(() => {
    setConsent("denied");
    void stopPostHog();
  }, []);

  const value = useMemo(
    () => ({ consent, grant, deny }),
    [consent, grant, deny],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}
