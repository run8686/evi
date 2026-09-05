import {
  askEvi,
  isEviChatConfigured,
} from "@/lib/evi-chat/openai-client.server";
import {
  clientKeyFromHeaders,
  isRateLimited,
} from "@/lib/evi-chat/rate-limit.server";
import {
  buildSystemPrompt,
  fallbackChannels,
} from "@/lib/evi-chat/system-prompt.server";
import { validateChatRequest } from "@/lib/evi-chat/validation";

/**
 * Backs the standalone "Frag Evi selbst" product-Q&A page.
 *
 * Stateless: the client resends the (capped) conversation every turn, and
 * nothing here is written to a database or a log. On any failure — missing
 * key, rate limit, timeout, provider error — this returns the same honest
 * fallback text instead of a raw error, so the widget never shows a broken
 * or invented reply. See src/lib/evi-chat/system-prompt.server.ts for the
 * scope and safety rules the model itself is given.
 */

const FALLBACK_REPLY =
  `Das kann ich hier gerade nicht sicher beantworten. Am besten meldest du ` +
  `dich direkt über ${fallbackChannels()} — dort hilft dir jemand weiter.`;

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const validation = validateChatRequest(body);
  if (!validation.ok) {
    return Response.json({ error: validation.reason }, { status: 400 });
  }

  const clientKey = clientKeyFromHeaders(request.headers);
  if (isRateLimited(clientKey)) {
    return Response.json(
      { reply: FALLBACK_REPLY, fallback: true },
      { status: 429 },
    );
  }

  if (!isEviChatConfigured()) {
    console.error("[evi-chat] OPENAI_API_KEY is not set — falling back.");
    return Response.json({ reply: FALLBACK_REPLY, fallback: true });
  }

  const result = await askEvi(buildSystemPrompt(), validation.turns);
  if (!result.ok) {
    return Response.json({ reply: FALLBACK_REPLY, fallback: true });
  }

  return Response.json({ reply: result.reply, fallback: false });
}
