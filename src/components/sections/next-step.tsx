"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

/**
 * The scroll-driven centrepiece: six phases inside one sticky viewport.
 *
 *   0–1  scattered thoughts, Evi arrives from off-screen
 *   2    the thoughts pull together
 *   3    they become three questions
 *   4    four possible next steps, one opening at a time
 *   5    the closing statement, Evi at full size
 *
 * Everything is driven by a single scroll listener, rAF-throttled, writing one
 * phase + one local progress value into state. Positions are percentages, so
 * the same choreography works at any viewport size; the `narrow` branch swaps
 * the desktop ring of cards for a vertical stack.
 *
 * With prefers-reduced-motion the whole thing renders as its resting state and
 * nothing moves — the content stays reachable either way.
 */

const CAPTIONS = [
  "Etwas beschäftigt dich.",
  "Du erzählst, was los ist. evi hört erst mal zu.",
  "Verstehen: worum geht es hier eigentlich?",
  "Sortieren: aus Gedanken werden Themen.",
  "Und dann: was wäre jetzt wirklich hilfreich?",
  "Ein Kreis, der sich schließt — und offen bleibt.",
] as const;

const FRAGMENTS = [
  "„Ich weiß gerade nicht weiter.“",
  "„Warum beschäftigt mich das so?“",
  "„Ich bekomme meine Gedanken nicht sortiert.“",
  "„Ich will jemanden nicht belasten.“",
  "„Ich mache mir Sorgen um jemanden.“",
  "„Ich muss eine Entscheidung treffen.“",
] as const;

const QUESTIONS = [
  "Was ist eigentlich passiert?",
  "Was macht das mit dir?",
  "Was brauchst du gerade?",
] as const;

const BRANCHES: readonly {
  dot: string;
  title: string;
  body: string;
  /** The acute branch: warm surface plus the link out to real help. */
  accent?: boolean;
}[] = [
  {
    dot: "bg-periwinkle-400",
    title: "evi reicht gerade.",
    body: "Ein Gedanke zum Mitnehmen. Eine neue Perspektive. Ein kleiner Schritt, der heute machbar ist.",
  },
  {
    dot: "bg-pink-400",
    title: "Ein Mensch tut jetzt gut.",
    body: "Freundin, Partner, Familie. evi hilft dir vorher zu sortieren, was du sagen willst — damit das Gespräch leichter anfängt.",
  },
  {
    dot: "bg-periwinkle-600",
    title: "Professionelle Hilfe passt besser.",
    body: "Beratungsstelle, Ärztin, Therapeut. evi hilft dir, die passende Anlaufstelle zu finden — und dranzubleiben.",
  },
  {
    dot: "bg-orange-500",
    title: "Es ist akut.",
    body: "Dann bleibt evi nicht in seiner Rolle. Ein evi Guide — ein Mensch — übernimmt und bleibt an deiner Seite, bis du bei passender Hilfe angekommen bist.",
    accent: true,
  },
];

/** Fragment positions: loose while scattered, tight once they converge. */
const LOOSE_WIDE = [
  [17, 23],
  [74, 16],
  [47, 46],
  [26, 72],
  [80, 62],
  [52, 88],
] as const;
const LOOSE_NARROW = [
  [46, 9],
  [57, 26],
  [43, 43],
  [58, 60],
  [42, 77],
  [52, 94],
] as const;
const TIGHT_WIDE = [
  [34, 32],
  [66, 28],
  [50, 50],
  [38, 66],
  [64, 62],
  [50, 82],
] as const;
const TIGHT_NARROW = [
  [48, 20],
  [52, 36],
  [48, 52],
  [52, 68],
  [48, 84],
  [52, 96],
] as const;

/** Evi's flight path, one entry per phase: x%, y%, scale, opacity, rotation. */
const EVI_WIDE = [
  [112, 24, 0.9, 0, -6],
  [76, 22, 1, 1, -4],
  [62, 12, 0.82, 1, -2],
  [19, 20, 0.68, 1, 0],
  [50, 50, 0.52, 1, 0],
  [50, 25, 1.5, 1, 0],
] as const;
const EVI_NARROW = [
  [112, 24, 0.85, 0, -6],
  [74, 20, 0.95, 1, -4],
  [66, 10, 0.8, 1, -2],
  [22, 16, 0.66, 1, 0],
  [89, -5, 0.36, 0.9, 0],
  [50, 22, 1.25, 1, 0],
] as const;

/** Desktop: the four branches sit around a ring. */
const BRANCH_POSITIONS = [
  { left: "50%", top: "2%", transform: "translate(-50%,0)" },
  { left: "82%", top: "50%", transform: "translate(-50%,-50%)" },
  { left: "50%", top: "98%", transform: "translate(-50%,-100%)" },
  { left: "18%", top: "50%", transform: "translate(-50%,-50%)" },
] as const;

/** Collapsed height plus the open height of each branch, for the mobile stack. */
const BRANCH_OPEN_HEIGHTS = [172, 178, 172, 214] as const;

export function NextStep() {
  const pathRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [phase, setPhase] = useState(0);
  const [local, setLocal] = useState(0);
  const [narrow, setNarrow] = useState(false);
  const reducedMotion = useReducedMotion();

  const onScroll = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const node = pathRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const ratio =
        scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
      const raw = ratio * 6;
      const nextPhase = Math.min(5, Math.max(0, Math.floor(raw)));

      setPhase(nextPhase);
      setLocal(Math.min(1, Math.max(0, raw - nextPhase)));
    });
  }, []);

  useEffect(() => {
    const onResize = () => {
      setNarrow(window.innerWidth < 760);
      onScroll();
    };

    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [onScroll]);

  // Resting state for reduced motion: the sorted layer and every branch open.
  const activePhase = reducedMotion ? 4 : phase;

  const layer = (from: number, to: number) => ({
    opacity: activePhase >= from && activePhase <= to ? 1 : 0,
    transform: reducedMotion
      ? "none"
      : `translateY(${activePhase < from ? "18px" : activePhase > to ? "-18px" : "0px"})`,
    pointerEvents:
      activePhase >= from && activePhase <= to
        ? ("auto" as const)
        : ("none" as const),
  });

  const fragment = (index: number) => {
    const converged = !reducedMotion && activePhase > 1;
    const table = converged
      ? narrow
        ? TIGHT_NARROW
        : TIGHT_WIDE
      : narrow
        ? LOOSE_NARROW
        : LOOSE_WIDE;
    const [x, y] = table[index];

    let opacity = 0;
    let scale = 1;
    if (activePhase === 0) {
      opacity = 1;
    } else if (activePhase === 1) {
      opacity = 0.82;
      scale = 0.98;
    } else if (activePhase === 2) {
      opacity = index === 2 ? 1 : 0.5;
      scale = index === 2 ? 1.05 : 0.9;
    }
    // Six bubbles do not fit on a phone without overlapping.
    if (narrow && index === 5) opacity = 0;

    return {
      left: `${x}%`,
      top: `${y}%`,
      opacity,
      transform: `translate(-50%,-50%) scale(${scale})`,
    };
  };

  const eviTable = narrow ? EVI_NARROW : EVI_WIDE;
  const evi = reducedMotion
    ? [eviTable[3][0], eviTable[3][1], eviTable[3][2], 1, 0]
    : eviTable[activePhase];

  const activeBranch =
    reducedMotion || activePhase > 4
      ? 3
      : activePhase < 4
        ? -1
        : Math.min(3, Math.floor(local * 4));

  // Mobile stack: measure the flow so the open card pushes the others aside.
  const tops: number[] = [];
  let flow = 0;
  for (let index = 0; index < BRANCHES.length; index += 1) {
    tops.push(flow);
    flow += (index === activeBranch ? BRANCH_OPEN_HEIGHTS[index] : 54) + 10;
  }
  const stackHeight = flow - 10;

  const branch = (index: number) => {
    const open = index === activeBranch;
    const shared = { opacity: open ? 1 : 0.68 };

    if (narrow) {
      return {
        ...shared,
        left: "50%",
        top: `calc(50% + ${Math.round(tops[index] - stackHeight / 2)}px)`,
        width: "92%",
        transform: "translate(-50%,0)",
      };
    }

    return {
      ...shared,
      ...BRANCH_POSITIONS[index],
      width: "clamp(186px,25%,244px)",
    };
  };

  return (
    <section id="naechster-schritt" aria-labelledby="naechster-schritt-titel">
      <Container className="flex flex-col items-center gap-4 pt-16 text-center sm:pt-28">
        <Reveal>
          <span className="inline-flex items-center rounded-full bg-periwinkle-50 px-3.5 py-1.5 text-[0.6875rem] font-extrabold tracking-[0.08em] text-periwinkle-700 uppercase">
            So ist evi gedacht
          </span>
        </Reveal>
        <Reveal delay={100}>
          <h2
            id="naechster-schritt-titel"
            className="max-w-[22ch] text-[clamp(1.9rem,5.6vw,3.6rem)] leading-[1.06] font-extrabold tracking-[-0.045em] text-pretty"
          >
            Jeder nächste Schritt fängt hier an.
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="max-w-[640px] text-lg leading-relaxed text-text-secondary text-pretty">
            Du musst noch nicht wissen, wie du es nennen sollst. Du erzählst, was
            dich beschäftigt — evi hilft beim Verstehen und Sortieren. Und zeigt
            dir nicht nur Antworten, sondern Richtungen. Manchmal liegt der
            passende Schritt außerhalb von evi.
          </p>
        </Reveal>
      </Container>

      {/* Six phases × 100vh of scroll distance. */}
      <div ref={pathRef} className="relative h-[600vh]">
        <div className="sticky top-0 z-[1] flex h-[100svh] flex-col items-center justify-center gap-3 px-4 pt-14 pb-5 sm:gap-5 sm:px-8 sm:pt-20">
          <div className="relative h-full max-h-[min(66svh,540px)] min-h-[320px] w-full max-w-[960px] flex-[1_1_auto]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[min(72%,520px)] -translate-1/2 rounded-full opacity-[0.09] blur-[70px] [background-image:var(--gradient-brand)]"
            />

            {/* Phases 0–2: the scattered thoughts. */}
            <div
              className="pointer-events-none absolute inset-0 [transition:opacity_600ms_var(--ease-standard)]"
              style={{ opacity: layer(0, 2).opacity }}
            >
              {FRAGMENTS.map((text, index) => {
                const position = fragment(index);
                return (
                  <div
                    key={text}
                    className="absolute w-max max-w-[min(70%,270px)] [transition:left_950ms_var(--ease-standard),top_950ms_var(--ease-standard),transform_950ms_var(--ease-standard),opacity_600ms_var(--ease-standard)]"
                    style={position}
                  >
                    <p
                      className="rounded-[20px_20px_20px_6px] border border-border bg-surface px-4 py-3 text-[clamp(0.875rem,1.7vw,1.1875rem)] leading-[1.28] font-semibold tracking-[-0.012em] shadow-sm text-pretty motion-safe:animate-float-soft"
                      style={{ animationDelay: `${index * 700}ms` }}
                    >
                      {text}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Phase 3: three questions. */}
            <div
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center [transition:opacity_600ms_var(--ease-standard),transform_800ms_var(--ease-standard)]"
              style={layer(3, 3)}
            >
              <p className="mb-4 text-[0.6875rem] font-extrabold tracking-[0.08em] text-periwinkle-700 uppercase sm:mb-6">
                Aus Gedanken werden Themen
              </p>
              <div className="flex max-w-full flex-col items-center">
                {QUESTIONS.map((question, index) => (
                  <div key={question} className="flex flex-col items-center">
                    {index > 0 ? (
                      <span
                        aria-hidden="true"
                        className="h-4 w-px bg-periwinkle-300 sm:h-6"
                      />
                    ) : null}
                    <div className="rounded-full border border-periwinkle-200 bg-surface px-5 py-3.5 text-center text-[clamp(1rem,2.1vw,1.5rem)] font-bold tracking-[-0.025em] shadow-sm text-pretty sm:px-7 sm:py-4">
                      {question}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase 4: the four possible next steps. */}
            <div
              className="absolute inset-0 [transition:opacity_600ms_var(--ease-standard),transform_800ms_var(--ease-standard)]"
              style={layer(4, 4)}
            >
              {!narrow ? (
                <div
                  aria-hidden="true"
                  className="absolute top-1/2 left-1/2 h-[min(66%,330px)] w-[min(66%,560px)] -translate-1/2 rounded-[50%] border border-dashed border-periwinkle-200 opacity-85"
                />
              ) : null}

              {BRANCHES.map((item, index) => {
                const position = branch(index);
                const open = index === activeBranch;
                return (
                  <div
                    key={item.title}
                    className={`absolute flex flex-col gap-2 rounded-[32px] border p-4 shadow-sm [transition:left_750ms_var(--ease-standard),top_750ms_var(--ease-standard),opacity_450ms_var(--ease-standard)] sm:p-5 ${
                      item.accent
                        ? "border-orange-200 bg-cream-100"
                        : "border-border bg-surface"
                    }`}
                    style={position}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className={`mt-[7px] size-[9px] shrink-0 rounded-full ${item.dot}`}
                      />
                      <p className="text-[clamp(0.9375rem,1.8vw,1.25rem)] leading-[1.22] font-bold tracking-[-0.025em] text-pretty">
                        {item.title}
                      </p>
                    </div>
                    <div
                      className="overflow-hidden [transition:max-height_650ms_var(--ease-standard),opacity_450ms_var(--ease-standard)]"
                      style={{
                        maxHeight: open ? "260px" : "0px",
                        opacity: open ? 1 : 0,
                      }}
                    >
                      <p className="text-sm leading-relaxed text-text-secondary text-pretty">
                        {item.body}
                      </p>
                      {item.accent ? (
                        <a
                          href="#akuthilfe"
                          className="mt-2 inline-block border-b border-orange-200 text-sm font-bold text-orange-700 [transition:border-color_var(--duration-base)_var(--ease-standard)] hover:border-orange-700"
                        >
                          Akuthilfe ansehen
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Phase 5: the closing statement. */}
            <div
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end gap-2 text-center [transition:opacity_600ms_var(--ease-standard),transform_800ms_var(--ease-standard)] sm:gap-3.5"
              style={layer(5, 5)}
            >
              <h3 className="text-[clamp(1.75rem,5.4vw,3.5rem)] leading-[1.04] font-extrabold tracking-[-0.05em] text-pretty">
                Du gehst weiter. evi bleibt da.
              </h3>
              <p className="max-w-[44ch] text-[clamp(0.9375rem,1.9vw,1.3125rem)] leading-relaxed text-text-secondary text-pretty">
                An guten Tagen und an schweren. Egal ob evi reicht oder ein
                Mensch übernimmt — du bleibst mit nichts allein.
              </p>
            </div>

            <div
              className="pointer-events-none absolute w-[clamp(76px,11vw,140px)] [transition:left_1100ms_var(--ease-standard),top_1100ms_var(--ease-standard),transform_1100ms_var(--ease-standard),opacity_700ms_var(--ease-standard)]"
              style={{
                left: `${evi[0]}%`,
                top: `${evi[1]}%`,
                opacity: evi[3],
                transform: `translate(-50%,-50%) scale(${evi[2]}) rotate(${evi[4]}deg)`,
              }}
            >
              <Image
                src="/assets/logo-mascot.png"
                width={994}
                height={834}
                alt="evi, der Begleiter"
                className="block h-auto w-full [filter:drop-shadow(0_12px_26px_rgba(45,20,90,0.16))] motion-safe:animate-float-soft"
              />
            </div>
          </div>

          <div className="relative h-14 w-full max-w-[760px] shrink-0">
            {CAPTIONS.map((caption, index) => (
              <p
                key={caption}
                aria-hidden={index !== activePhase}
                className="absolute inset-0 flex items-center justify-center text-center text-[clamp(0.9375rem,2vw,1.3125rem)] font-bold tracking-[-0.025em] text-pretty [transition:opacity_450ms_var(--ease-standard)]"
                style={{ opacity: index === activePhase ? 1 : 0 }}
              >
                {caption}
              </p>
            ))}
          </div>

          <div aria-hidden="true" className="flex shrink-0 gap-2">
            {CAPTIONS.map((caption, index) => (
              <span
                key={caption}
                className="h-[3px] w-[clamp(22px,3.4vw,34px)] overflow-hidden rounded-full bg-periwinkle-100"
              >
                <span
                  className="block h-full bg-periwinkle-500 [transition:width_180ms_linear]"
                  style={{
                    width:
                      index < activePhase
                        ? "100%"
                        : index === activePhase
                          ? `${Math.round(local * 100)}%`
                          : "0%",
                  }}
                />
              </span>
            ))}
          </div>
        </div>
      </div>

      <Container width="narrow" className="pt-6 pb-16 text-center sm:pt-10 sm:pb-28">
        <p className="text-[clamp(1.25rem,2.8vw,2rem)] leading-[1.16] font-extrabold tracking-[-0.04em] text-text-secondary text-pretty">
          Nicht jede Frage muss evi allein lösen. Aber jede Frage darf hier
          beginnen.
        </p>
      </Container>
    </section>
  );
}
