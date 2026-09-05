import "server-only";

/**
 * Talks to the Anthropic Messages API directly over its REST endpoint —
 * mirroring src/lib/mail/send.server.ts: one provider, one function, no SDK.
 * A dependency that wraps a single POST is a dependency to keep updated for
 * no gain, and this is the only file that would need to change if that
 * calculus ever changes.
 *
 * Nothing here logs a message's content. A failure is logged by reason only,
 * matching the mail-sending convention.
 */

const MESSAGES_ENDPOINT = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

/** A widget on a marketing page is not worth holding a request open for. */
const TIMEOUT_MS = 15_000;

/** Chat replies are short chat bubbles, not essays — keep the ceiling tight. */
const MAX_RESPONSE_TOKENS = 400;

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-5";

export function isEviChatConfigured(): boolean {
  return Boolean(API_KEY);
}

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type AskEviResult =
  | { ok: true; reply: string }
  | { ok: false; reason: string };

export async function askEvi(
  systemPrompt: string,
  turns: ChatTurn[],
): Promise<AskEviResult> {
  if (!API_KEY) {
    // Callers must check isEviChatConfigured() first and show the honest
    // fallback themselves — reaching here is a configuration bug, not a
    // normal "no answer" case.
    return { ok: false, reason: "not_configured" };
  }

  let response: Response;
  try {
    response = await fetch(MESSAGES_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_RESPONSE_TOKENS,
        // Grounded, short answers don't need extended thinking — turning it
        // off keeps latency and cost down for this widget.
        thinking: { type: "disabled" },
        system: systemPrompt,
        messages: turns.map((turn) => ({
          role: turn.role,
          content: turn.content,
        })),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (cause) {
    const reason =
      cause instanceof Error && cause.name === "TimeoutError"
        ? "timeout"
        : "network";
    console.error("[evi-chat] request failed", { reason });
    return { ok: false, reason };
  }

  if (!response.ok) {
    console.error("[evi-chat] provider rejected the request", {
      status: response.status,
    });
    return { ok: false, reason: `http_${response.status}` };
  }

  try {
    const body: unknown = await response.json();
    const reply = extractText(body);
    if (reply) return { ok: true, reply };
  } catch {
    // Falls through to the generic failure below.
  }

  console.error("[evi-chat] provider returned no readable text");
  return { ok: false, reason: "invalid_response" };
}

function extractText(body: unknown): string | null {
  if (!body || typeof body !== "object" || !("content" in body)) return null;
  const content = (body as { content: unknown }).content;
  if (!Array.isArray(content)) return null;

  const text = content
    .filter(
      (block): block is { type: "text"; text: string } =>
        Boolean(block) &&
        typeof block === "object" &&
        (block as { type?: unknown }).type === "text" &&
        typeof (block as { text?: unknown }).text === "string",
    )
    .map((block) => block.text)
    .join("\n")
    .trim();

  return text || null;
}
