"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { ANALYTICS_EVENTS, track } from "@/lib/analytics/events";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

const SLIDE_MS = 7000;

/**
 * Full-viewport photo slideshow.
 *
 * Order and pairing are fixed content decisions, not a shuffle: each headline
 * belongs to the photo behind it. Only the first image is `priority` — the
 * other three load lazily, so the LCP is one photo, not four.
 */
const SLIDES = [
  {
    src: "/assets/photos/hero-1.jpg",
    headline: "Alles muss nicht in deinem Kopf bleiben.",
  },
  {
    src: "/assets/photos/hero-2.jpg",
    headline: "Wenn du dich selbst gerade nicht ganz verstehst.",
  },
  {
    src: "/assets/photos/hero-3.jpg",
    headline: "Wenn dich ein Mensch beschäftigt, der dir wichtig ist.",
  },
  {
    src: "/assets/photos/hero-4.jpg",
    headline: "Wenn du gerade nicht weißt, wohin.",
  },
] as const;

export function Hero() {
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const reducedMotion = useReducedMotion();
  const lastRef = useRef(0);

  const goTo = useCallback((next: number) => {
    lastRef.current =
      typeof performance === "undefined" ? 0 : performance.now();
    setIndex((next + SLIDES.length) % SLIDES.length);
    setElapsed(0);
  }, []);

  // The progress bars need a sub-second tick; the slide itself only changes
  // every seven. One interval drives both.
  useEffect(() => {
    if (reducedMotion) return;

    lastRef.current = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const delta = now - lastRef.current;
      lastRef.current = now;

      setElapsed((current) => {
        const next = current + delta;
        if (next < SLIDE_MS) return next;
        setIndex((slide) => (slide + 1) % SLIDES.length);
        return 0;
      });
    }, 60);

    return () => window.clearInterval(id);
  }, [reducedMotion]);

  const progress = Math.min(100, (elapsed / SLIDE_MS) * 100);

  return (
    <section
      aria-label="evi – Einstieg"
      // svh, not vh: on iOS Safari a vh-tall hero hides its own headline
      // behind the browser chrome until the address bar collapses.
      className="relative flex h-[100svh] max-h-[900px] min-h-[560px] flex-col justify-end overflow-hidden bg-neutral-900"
    >
      {SLIDES.map((slide, slideIndex) => (
        <div
          key={slide.src}
          aria-hidden={slideIndex !== index}
          className="absolute inset-0 overflow-hidden [transition:opacity_1400ms_var(--ease-standard)]"
          style={{ opacity: slideIndex === index ? 1 : 0 }}
        >
          <Image
            src={slide.src}
            alt=""
            fill
            priority={slideIndex === 0}
            loading={slideIndex === 0 ? undefined : "lazy"}
            sizes="100vw"
            className="object-cover motion-safe:animate-ken"
          />
          <div className="absolute inset-0 [background:linear-gradient(180deg,rgba(20,14,18,0.52)_0%,rgba(20,14,18,0.28)_42%,rgba(20,14,18,0.82)_100%)]" />
        </div>
      ))}

      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-5 pb-7 sm:px-8 sm:pb-8">
        <div className="relative">
          {SLIDES.map((slide, slideIndex) => (
            <h1
              key={slide.src}
              aria-hidden={slideIndex !== index}
              className={`max-w-[16ch] text-[clamp(1.9rem,7vw,3.9rem)] leading-[1.08] font-extrabold tracking-[-0.04em] text-white text-pretty [text-shadow:0_4px_30px_rgba(0,0,0,0.35)] [transition:opacity_900ms_var(--ease-standard)] ${
                slideIndex === index ? "" : "pointer-events-none absolute inset-0"
              }`}
              style={{ opacity: slideIndex === index ? 1 : 0 }}
            >
              {slide.headline}
            </h1>
          ))}
        </div>

        <p className="text-[0.9375rem] font-bold tracking-[0.02em] text-white/90 sm:text-lg">
          Reden. Verstehen. Sortieren. Weiterkommen.
        </p>

        <div className="flex items-center gap-3">
          <a
            href="#early-access"
            onClick={() => void track(ANALYTICS_EVENTS.heroEarlyAccessClick)}
            className="inline-flex min-h-12 items-center justify-center rounded-full px-6 text-base font-bold text-white [background-image:var(--gradient-cta)] [box-shadow:var(--shadow-glow-brand)] [transition:transform_var(--duration-base)_var(--ease-standard),background_var(--duration-base)_var(--ease-standard)] hover:[background-image:var(--gradient-cta-hover)] motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.98]"
          >
            Early Access sichern
          </a>
          <a
            href="#so-funktioniert"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 bg-white/12 px-5 text-[0.9375rem] font-semibold text-white backdrop-blur-[10px] [transition:background_var(--duration-base)_var(--ease-standard)] hover:bg-white/25"
          >
            Erst ansehen
          </a>
        </div>

        <p className="text-sm font-medium text-white/80">
          Für dich ohne Kosten – heute und auch in Zukunft.
        </p>

        <div className="flex items-center gap-3">
          {/* Arrows are desktop-only: on a phone the thumb has the bars. */}
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Vorheriges Bild"
            className="hidden size-11 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/12 text-white backdrop-blur-[10px] [transition:background_var(--duration-base)_var(--ease-standard)] hover:bg-white/25 sm:inline-flex"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Nächstes Bild"
            className="hidden size-11 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/12 text-white backdrop-blur-[10px] [transition:background_var(--duration-base)_var(--ease-standard)] hover:bg-white/25 sm:inline-flex"
          >
            <Chevron direction="right" />
          </button>

          <div className="flex flex-1 gap-2">
            {SLIDES.map((slide, slideIndex) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => goTo(slideIndex)}
                aria-label={`Bild ${slideIndex + 1} von ${SLIDES.length} anzeigen`}
                aria-current={slideIndex === index || undefined}
                // 44px tap height, 4px of visible rail inside it.
                className="flex h-11 flex-1 items-center"
              >
                <span className="h-1 w-full overflow-hidden rounded-full bg-white/30">
                  <span
                    className="block h-full rounded-full bg-white [transition:width_180ms_linear]"
                    style={{
                      width:
                        slideIndex < index
                          ? "100%"
                          : slideIndex === index
                            ? `${reducedMotion ? 100 : progress}%`
                            : "0%",
                    }}
                  />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5"
    >
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}
