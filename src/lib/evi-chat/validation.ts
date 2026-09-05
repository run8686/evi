/**
 * Chat request validation.
 *
 * Runs on the server, on every request. The client caps message length and
 * history too, but a Server Action / route handler is reachable by direct
 * POST — the browser-side cap is a convenience, not a guarantee.
 */

/** A chat bubble, not an essay. */
export const MAX_MESSAGE_LENGTH = 500;

/** Enough for a real back-and-forth without letting the payload (and the
 * cost of resending it every turn) grow unbounded. */
export const MAX_HISTORY_TURNS = 8;

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ChatRequestValidation =
  | { ok: true; turns: ChatTurn[] }
  | {
      ok: false;
      reason: "empty" | "too_many_turns" | "message_too_long" | "malformed";
    };

export function validateChatRequest(raw: unknown): ChatRequestValidation {
  if (!raw || typeof raw !== "object" || !("messages" in raw)) {
    return { ok: false, reason: "malformed" };
  }

  const messages = (raw as { messages: unknown }).messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, reason: "empty" };
  }
  if (messages.length > MAX_HISTORY_TURNS) {
    return { ok: false, reason: "too_many_turns" };
  }

  const turns: ChatTurn[] = [];
  for (const entry of messages) {
    if (!entry || typeof entry !== "object") {
      return { ok: false, reason: "malformed" };
    }
    const role = (entry as { role?: unknown }).role;
    const content = (entry as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") {
      return { ok: false, reason: "malformed" };
    }
    if (typeof content !== "string" || !content.trim()) {
      return { ok: false, reason: "malformed" };
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
      return { ok: false, reason: "message_too_long" };
    }
    turns.push({ role, content: content.trim() });
  }

  if (turns[turns.length - 1]?.role !== "user") {
    return { ok: false, reason: "malformed" };
  }

  return { ok: true, turns };
}
