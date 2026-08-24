"use client";

import { useEffect, useRef } from "react";

import { track, type AnalyticsEvent } from "@/lib/analytics/events";

/**
 * Fires a single event the first time its position scrolls into view. Renders
 * nothing — used to measure whether people actually reach the signup section.
 */
export function ViewTracker({ event }: { event: AnalyticsEvent }) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          void track(event);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [event]);

  return <span ref={ref} aria-hidden="true" className="block h-px w-full" />;
}
