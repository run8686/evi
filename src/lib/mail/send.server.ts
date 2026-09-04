import "server-only";

/**
 * Outgoing mail.
 *
 * One provider, one function, one narrow message shape. Resend is called over
 * its REST API rather than through its SDK: the request is a single POST, and
 * a dependency that wraps one POST is a dependency to keep updated for no
 * gain.
 *
 * The interface is deliberately provider-agnostic. Resend is a US company, so
 * the privacy policy carries a third-country transfer entry; if that is ever
 * traded for an EU provider, this file is the only one that changes.
 *
 * Nothing here logs a recipient address. A failure is logged by reason.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Mail is not the page load path — fail rather than hold a request open. */
const TIMEOUT_MS = 10_000;

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** ISO timestamp for a Resend-scheduled transactional message. */
  scheduledAt?: string;
  /**
   * Resend request idempotency. Use for mail triggered by a token so a timeout
   * followed by a retry cannot create a duplicate delivery.
   */
  idempotencyKey?: string;
  /**
   * Extra RFC headers, e.g. List-Unsubscribe. Deliberately not typed to a
   * fixed set — the provider passes them through and the caller decides.
   */
  headers?: Record<string, string>;
};

export type MailResult =
  | { ok: true; id: string }
  | { ok: false; reason: string };

const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.WAITLIST_MAIL_FROM;

export function isMailConfigured(): boolean {
  return Boolean(API_KEY && FROM);
}

export async function sendMail(message: MailMessage): Promise<MailResult> {
  if (!API_KEY || !FROM) {
    // Callers must check isMailConfigured() first. Reaching here means a
    // signup would be stored with no way to confirm it, so it is a failure,
    // not a warning.
    return { ok: false, reason: "not_configured" };
  }

  let response: Response;
  try {
    response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        ...(message.idempotencyKey
          ? { "Idempotency-Key": message.idempotencyKey }
          : {}),
      },
      body: JSON.stringify({
        from: FROM,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(message.scheduledAt
          ? { scheduled_at: message.scheduledAt }
          : {}),
        ...(message.headers ? { headers: message.headers } : {}),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (cause) {
    const reason =
      cause instanceof Error && cause.name === "TimeoutError"
        ? "timeout"
        : "network";
    console.error("[mail] request failed", { reason });
    return { ok: false, reason };
  }

  if (!response.ok) {
    // Read the body for the reason, but never echo it verbatim into the log:
    // provider errors quote the recipient address back.
    let detail = "unknown";
    try {
      const body: unknown = await response.json();
      if (body && typeof body === "object" && "name" in body) {
        detail = String((body as { name: unknown }).name);
      }
    } catch {
      // A non-JSON body tells us nothing beyond the status code.
    }
    console.error("[mail] provider rejected the message", {
      status: response.status,
      detail,
    });
    return { ok: false, reason: `http_${response.status}` };
  }

  try {
    const body: unknown = await response.json();
    if (
      body &&
      typeof body === "object" &&
      "id" in body &&
      typeof (body as { id: unknown }).id === "string"
    ) {
      return { ok: true, id: (body as { id: string }).id };
    }
  } catch {
    // A successful Resend response is JSON and contains the message id.
  }

  console.error("[mail] provider returned no message id");
  return { ok: false, reason: "invalid_response" };
}

/** Cancel a Resend message that was scheduled but has not been sent yet. */
export async function cancelScheduledMail(emailId: string): Promise<MailResult> {
  if (!API_KEY) return { ok: false, reason: "not_configured" };
  if (!emailId || emailId.length > 200) {
    return { ok: false, reason: "invalid_id" };
  }

  let response: Response;
  try {
    response = await fetch(
      `${RESEND_ENDPOINT}/${encodeURIComponent(emailId)}/cancel`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${API_KEY}` },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
  } catch (cause) {
    const reason =
      cause instanceof Error && cause.name === "TimeoutError"
        ? "timeout"
        : "network";
    console.error("[mail] scheduled cancellation failed", { reason });
    return { ok: false, reason };
  }

  if (!response.ok) {
    console.error("[mail] provider rejected scheduled cancellation", {
      status: response.status,
    });
    return { ok: false, reason: `http_${response.status}` };
  }

  return { ok: true, id: emailId };
}
