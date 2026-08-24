"use client";

import { ANALYTICS_EVENTS, track, type AnalyticsEvent } from "@/lib/analytics/events";
import { SOCIAL } from "@/lib/constants";

/**
 * Social channels. Deliberately quiet: these must never compete with the
 * Early Access call to action, so they are icon-sized and never use the brand
 * gradient.
 */

type Channel = {
  label: string;
  href: string;
  event: AnalyticsEvent;
  icon: "instagram" | "tiktok" | "linkedin";
  /** Why this channel exists, for the footer's longer list. */
  audience: string;
};

const CHANNELS: Channel[] = [
  {
    label: "Instagram",
    href: SOCIAL.instagram,
    event: ANALYTICS_EVENTS.instagramClick,
    icon: "instagram",
    audience: "Community",
  },
  {
    label: "TikTok",
    href: SOCIAL.tiktok,
    event: ANALYTICS_EVENTS.tiktokClick,
    icon: "tiktok",
    audience: "Einblicke",
  },
  {
    label: "LinkedIn",
    href: SOCIAL.linkedin,
    event: ANALYTICS_EVENTS.linkedinClick,
    icon: "linkedin",
    audience: "Hochschulen & Partner",
  },
];

export function SocialLinks({
  background = "light",
  showLabels = false,
  className = "",
}: {
  background?: "light" | "dark";
  showLabels?: boolean;
  className?: string;
}) {
  const tone =
    background === "dark"
      ? "border-white/15 text-white/70 hover:border-white/35 hover:text-white"
      : "border-border text-text-tertiary hover:border-border-strong hover:text-text-primary";

  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {CHANNELS.map((channel) => (
        <li key={channel.label}>
          <a
            href={channel.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => void track(channel.event)}
            aria-label={`Evi auf ${channel.label} (öffnet in neuem Tab)`}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 transition-colors ${tone}`}
          >
            <SocialIcon name={channel.icon} />
            {showLabels ? (
              <span className="text-sm font-medium">{channel.label}</span>
            ) : null}
          </a>
        </li>
      ))}
    </ul>
  );
}

function SocialIcon({ name }: { name: Channel["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "size-[1.15rem]",
  };

  if (name === "instagram") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5.2" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "tiktok") {
    return (
      <svg {...common}>
        <path d="M14.2 3.6v9.9a3.4 3.4 0 1 1-2.7-3.33" />
        <path d="M14.2 3.6c.44 2.3 1.95 3.75 4.2 3.95" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3" y="3" width="18" height="18" rx="4.2" />
      <path d="M7.4 10.4V17" />
      <circle cx="7.4" cy="7.3" r="1.05" fill="currentColor" stroke="none" />
      <path d="M11.6 17v-3.6a2.55 2.55 0 0 1 5.1 0V17" />
    </svg>
  );
}

export { CHANNELS as SOCIAL_CHANNELS };
