import "server-only";

/**
 * Calls OpenAI's Responses API directly over fetch(), keeping the provider
 * boundary in one server-only file and avoiding an SDK for a single request.
 * Message content is never logged by this application.
 */

const RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses";
const TIMEOUT_MS = 15_000;
const MAX_OUTPUT_TOKENS = 400;

const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-5.6-luna";

export function isEviChatConfigured(): boolean {
  return Boolean(API_KEY);
}

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type AskEviResult =
  | { ok: true; reply: string }
  | { ok: false; reason: string };

export async function askEvi(
  instructions: string,
  turns: ChatTurn[],
): Promise<AskEviResult> {
  if (!API_KEY) {
    return { ok: false, reason: "not_configured" };
  }

  let response: Response;
  try {
    response = await fetch(RESPONSES_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        instructions,
        input: turns.map((turn) => ({
          role: turn.role,
          content: turn.content,
        })),
        max_output_tokens: MAX_OUTPUT_TOKENS,
        // The browser carries the conversation on every turn, so OpenAI does
        // not need to persist response state for this stateless widget.
        store: false,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (cause) {
    const reason =
      cause instanceof Error && cause.name === "TimeoutError"
        ? "timeout"
        : "network";
    console.error("[evi-chat] OpenAI request failed", { reason });
    return { ok: false, reason };
  }

  if (!response.ok) {
    console.error("[evi-chat] OpenAI rejected the request", {
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

  console.error("[evi-chat] OpenAI returned no readable text");
  return { ok: false, reason: "invalid_response" };
}

function extractText(body: unknown): string | null {
  if (!body || typeof body !== "object" || !("output" in body)) return null;
  const output = (body as { output: unknown }).output;
  if (!Array.isArray(output)) return null;

  const text = output
    .flatMap((item) => {
      if (!item || typeof item !== "object" || !("content" in item)) return [];
      const content = (item as { content: unknown }).content;
      return Array.isArray(content) ? content : [];
    })
    .filter(
      (part): part is { type: "output_text"; text: string } =>
        Boolean(part) &&
        typeof part === "object" &&
        (part as { type?: unknown }).type === "output_text" &&
        typeof (part as { text?: unknown }).text === "string",
    )
    .map((part) => part.text)
    .join("\n")
    .trim();

  return text || null;
}
