"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

/**
 * Fades content in once, when it first scrolls into view.
 *
 * Motion is decoration: with prefers-reduced-motion the content is simply
 * visible from the start, and a <noscript> rule in the root layout covers the
 * case where the observer never runs at all.
 */
export function Reveal({
  children,
  className = "",
  /** Stagger within a group, in milliseconds. Keep small — this is a page, not a slideshow. */
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setInView(true);
          observer.disconnect();
        }
      },
      // Trigger slightly before the element is fully on screen so the motion
      // finishes as it settles, instead of starting after it has arrived.
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const visible = reducedMotion || inView;

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`.trim()}
      style={delay && !reducedMotion ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
