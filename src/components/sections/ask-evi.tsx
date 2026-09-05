"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";

import { Mascot } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { buttonStyles } from "@/components/ui/button";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics/events";
import { SOCIAL, SUPPORT_EMAIL } from "@/lib/constants";

const MAX_MESSAGE_LENGTH = 500;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Frag mich, was du über Evi wissen willst — zum Beispiel, wofür Evi da ist oder wie die Warteliste funktioniert.",
};

function networkFallback(): string {
  const channels = [`eine Instagram-DM an ${SOCIAL.instagram}`];
  if (SUPPORT_EMAIL) channels.push(`eine E-Mail an ${SUPPORT_EMAIL}`);
  return `Gerade komme ich nicht durch. Schreib uns stattdessen ${channels.join(" oder ")}.`;
}

/**
 * Live demo of how Evi answers, grounded in the master document read by
 * src/app/api/evi-chat/route.ts. Deliberately scoped to product Q&A — see the
 * disclaimer below the widget and the system prompt in
 * src/lib/evi-chat/system-prompt.server.ts for the actual boundaries.
 */
export function AskEvi() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const inputId = useId();
  const logRef = useRef<HTMLDivElement | null>(null);

  const canSend = draft.trim().length > 0 && !pending;

  async function sendMessage() {
    const content = draft.trim();
    if (!content || pending) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(nextMessages);
    setDraft("");
    setPending(true);
    void track(ANALYTICS_EVENTS.eviChatMessageSent);

    try {
      const response = await fetch("/api/evi-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only the last few turns travel with the request — enough context
        // for a follow-up question without an unbounded, ever-growing payload.
        body: JSON.stringify({ messages: nextMessages.slice(-8) }),
      });

      const data: unknown = await response.json().catch(() => null);
      const reply =
        data && typeof data === "object" && "reply" in data
          ? String((data as { reply: unknown }).reply)
          : networkFallback();
      const isFallback =
        !response.ok ||
        Boolean(data && typeof data === "object" && (data as { fallback?: unknown }).fallback);

      if (isFallback) void track(ANALYTICS_EVENTS.eviChatFallbackShown);

      setMessages((current) => [
        ...current,
        { role: "assistant", content: reply },
      ]);
    } catch {
      void track(ANALYTICS_EVENTS.eviChatFallbackShown);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: networkFallback() },
      ]);
    } finally {
      setPending(false);
      queueMicrotask(() => {
        logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
      });
    }
  }

  return (
    <section id="frag-evi" className="bg-bg-subtle section-y">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-sm font-bold tracking-[0.14em] text-link uppercase">
            Live-Vorschau
          </p>
          <h2 className="mt-4 text-[2.1rem] leading-[1.1] font-extrabold tracking-[-0.025em] text-balance text-text-primary sm:text-5xl">
            Frag Evi selbst…
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-tertiary">
            Bevor du dich einträgst, kannst du Evi direkt fragen, was sie kann
            und wie sie antwortet.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-10">
          <div className="mx-auto max-w-2xl glass rounded-[32px] p-5 sm:p-6">
            <div className="flex items-center gap-3 border-b border-white/50 pb-4">
              <Mascot className="h-9 w-auto" />
              <div>
                <p className="text-[0.9375rem] font-bold text-text-primary">
                  Evi
                </p>
                <p className="text-[0.8125rem] text-text-secondary">
                  Automatisierte Vorschau
                </p>
              </div>
            </div>

            <div
              ref={logRef}
              role="log"
              aria-live="polite"
              className="mt-4 max-h-[22rem] space-y-3 overflow-y-auto pr-1"
            >
              {messages.map((message, index) => (
                <p
                  key={index}
                  className={
                    message.role === "user"
                      ? "ml-auto max-w-[85%] rounded-[20px] rounded-br-md bg-white/70 px-4 py-3 text-[0.9375rem] leading-relaxed text-text-primary"
                      : "max-w-[90%] rounded-[20px] rounded-bl-md bg-orange-50 px-4 py-3 text-[0.9375rem] leading-relaxed text-text-primary"
                  }
                >
                  {message.content}
                </p>
              ))}
              {pending ? (
                <p className="max-w-[90%] rounded-[20px] rounded-bl-md bg-orange-50 px-4 py-3 text-[0.9375rem] text-text-secondary">
                  Evi tippt …
                </p>
              ) : null}
            </div>

            <form
              className="mt-4 flex items-end gap-2 border-t border-white/50 pt-4"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
            >
              <label htmlFor={inputId} className="sr-only">
                Deine Frage an Evi
              </label>
              <input
                id={inputId}
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                maxLength={MAX_MESSAGE_LENGTH}
                disabled={pending}
                placeholder="z. B. Was kann Evi eigentlich?"
                autoComplete="off"
                className="min-h-12 w-full rounded-2xl border border-border bg-surface px-4 text-base text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!canSend}
                className={buttonStyles({ size: "md" })}
              >
                Senden
              </button>
            </form>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mt-5 max-w-2xl text-center text-[0.8125rem] leading-relaxed text-text-secondary">
            Automatisiert und nur zum Produkt Evi — keine Beratung und keine
            Nothilfe.{" "}
            <Link
              href="/akute-hilfe"
              className="font-medium text-link underline underline-offset-2"
            >
              Wege zu akuter Hilfe
            </Link>
            .
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
