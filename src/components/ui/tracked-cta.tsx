"use client";

import type { ReactNode } from "react";

import {
  buttonStyles,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/button";
import { track, type AnalyticsEvent } from "@/lib/analytics/events";

/**
 * An anchor that reports which Early Access entry point was used, so the
 * funnel can be read per placement. Keeps the surrounding sections as server
 * components — only the click handler needs the client.
 */
export function TrackedCta({
  href,
  event,
  location,
  children,
  variant,
  size,
  className,
}: {
  href: string;
  event: AnalyticsEvent;
  /** Only used with the generic early_access_click event. */
  location?: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <a
      href={href}
      onClick={() => void track(event, location ? { location } : undefined)}
      className={buttonStyles({ variant, size, className })}
    >
      {children}
    </a>
  );
}
