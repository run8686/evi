"use server";

import {
  getWaitlistClient,
  isWaitlistConfigured,
} from "@/lib/supabase/waitlist-client.server";
import {
  normalizeAttributionValue,
  normalizeFirstName,
  validateEmail,
} from "./validation";
import {
  createToken,
  hashToken,
  isTokenSecretConfigured,
  unsubscribeTokenFor,
} from "./tokens.server";
import {
  cancelScheduledMail,
  isMailConfigured,
  sendMail,
} from "@/lib/mail/send.server";
import { confirmWaitlistMail } from "@/lib/mail/templates/confirm-waitlist";
import { remindWaitlistMail } from "@/lib/mail/templates/remind-waitlist";
import { SITE } from "@/lib/constants";
import type { WaitlistState } from "./state";

const REMINDER_DELAY_MS = 24 * 60 * 60 * 1000;

type ConfirmationRequestRow = {
  result: string;
  previous_reminder_email_id: string | null;
};

function readConfirmationRequest(value: unknown): ConfirmationRequestRow | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const row: unknown = value[0];
  if (!row || typeof row !== "object") return null;

  const candidate = row as Record<string, unknown>;
  if (
    typeof candidate.result !== "string" ||
    (candidate.previous_reminder_email_id !== null &&
      typeof candidate.previous_reminder_email_id !== "string")
  ) {
    return null;
  }

  return {
    result: candidate.result,
    previous_reminder_email_id: candidate.previous_reminder_email_id,
  };
}

const EMAIL_ERRORS: Record<string, string> = {
  missing: "Bitte gib deine E-Mail-Adresse ein.",
  too_long: "Diese E-Mail-Adresse ist zu lang.",
  invalid: "Diese E-Mail-Adresse sieht nicht ganz richtig aus.",
};

const UNAVAILABLE: WaitlistState = {
  status: "error",
  code: "unavailable",
  message:
    "Die Warteliste ist gerade nicht erreichbar. Bitte versuch es später noch einmal.",
};

const UNKNOWN: WaitlistState = {
  status: "error",
  code: "unknown",
  message: "Das hat gerade nicht funktioniert. Bitte versuch es noch einmal.",
};

const MAIL_FAILED: WaitlistState = {
  status: "error",
  code: "unknown",
  message:
    "Wir konnten dir gerade keine Bestätigungsmail schicken. Bitte versuch es noch einmal.",
};

/**
 * Starts a waitlist signup.
 *
 * Nobody is on the list after this function returns — they are on it once they
 * click the button in the mail it sends. That is what makes the consent
 * provable, and it stops anyone from putting a stranger's address on a
 * mental-health waiting list.
 *
 * Storing and confirming both go through `security definer` functions rather
 * than direct table access: the anon key this app holds has no read access to
 * the waitlist and must not gain any (see migration 0003).
 *
 * Never stores anything about a person's mental health — the form does not
 * ask, and the table has nowhere to put it.
 */
export async function joinWaitlist(
  _previousState: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  // Honeypot: a hidden field no sighted or screen-reader user reaches. If it
  // has content, a bot filled the form. Report success so it moves on, and
  // store nothing.
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return { status: "success" };
  }

  const emailResult = validateEmail(formData.get("email"));
  if (!emailResult.ok) {
    return {
      status: "error",
      code: "invalid_email",
      message: EMAIL_ERRORS[emailResult.reason] ?? EMAIL_ERRORS.invalid,
    };
  }

  // Both halves are required. A signup that is stored but cannot be confirmed
  // is not a signup, so a missing mail key is just as fatal as a missing
  // database — and is reported instead of hidden behind a success screen.
  if (
    !isWaitlistConfigured() ||
    !isMailConfigured() ||
    !isTokenSecretConfigured()
  ) {
    console.error("[waitlist] not configured — signup rejected", {
      database: isWaitlistConfigured(),
      mail: isMailConfigured(),
      tokenSecret: isTokenSecretConfigured(),
    });
    return UNAVAILABLE;
  }

  const client = getWaitlistClient();
  if (!client) return UNAVAILABLE;

  const confirmationToken = createToken();
  // Derived from the address, so the link in a mail sent weeks ago still works.
  const unsubscribeToken = unsubscribeTokenFor(emailResult.email);
  const firstName = normalizeFirstName(formData.get("first_name"));

  try {
    const tokenHash = hashToken(confirmationToken);
    const { data, error } = await client.rpc(
      "waitlist_request_confirmation_with_reminder",
      {
        p_email: emailResult.email,
        p_first_name: firstName,
        p_locale: SITE.locale,
        p_utm_source: normalizeAttributionValue(formData.get("utm_source")),
        p_utm_medium: normalizeAttributionValue(formData.get("utm_medium")),
        p_utm_campaign: normalizeAttributionValue(formData.get("utm_campaign")),
        p_utm_content: normalizeAttributionValue(formData.get("utm_content")),
        p_utm_term: normalizeAttributionValue(formData.get("utm_term")),
        p_referrer: normalizeAttributionValue(formData.get("referrer")),
        // Checkbox: present only when actively ticked. Never defaulted to true.
        p_marketing_consent: formData.get("marketing_consent") === "on",
        p_confirmation_token_hash: tokenHash,
        p_unsubscribe_token_hash: hashToken(unsubscribeToken),
      },
    );

    if (error) {
      // Log the reason, never the address.
      console.error("[waitlist] request failed", {
        code: error.code,
        message: error.message,
      });
      return UNKNOWN;
    }

    const request = readConfirmationRequest(data);
    if (!request) {
      console.error("[waitlist] request returned an unexpected result");
      return UNKNOWN;
    }

    // A repeated request can replace a token. Cancel its old reminder before
    // scheduling the new one, so nobody receives a stale confirmation link.
    if (request.previous_reminder_email_id) {
      const cancelled = await cancelScheduledMail(
        request.previous_reminder_email_id,
      );
      if (!cancelled.ok) {
        console.error("[waitlist] previous reminder cancellation failed", {
          reason: cancelled.reason,
        });
      }
    }

    // 'already_confirmed' and 'throttled' both mean: do not send a mail, and
    // show the same screen as a first-time signup. Whether an address is
    // already on the list is not something a form should reveal.
    if (request.result !== "send") {
      return { status: "success" };
    }

    const mail = confirmWaitlistMail({
      token: confirmationToken,
      firstName,
      unsubscribeToken,
    });
    const sent = await sendMail({
      to: emailResult.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      headers: mail.headers,
      idempotencyKey: `waitlist-confirm/${tokenHash}`,
    });

    if (!sent.ok) {
      // The row exists with a token, but no mail went out and nothing was
      // marked as delivered — so an immediate retry is allowed rather than
      // throttled. Telling the person is the honest answer; a success screen
      // for a mail that never arrives is not.
      return MAIL_FAILED;
    }

    const reminderAt = new Date(Date.now() + REMINDER_DELAY_MS).toISOString();
    const reminder = remindWaitlistMail({
      token: confirmationToken,
      firstName,
      unsubscribeToken,
    });
    const scheduled = await sendMail({
      to: emailResult.email,
      subject: reminder.subject,
      html: reminder.html,
      text: reminder.text,
      headers: reminder.headers,
      scheduledAt: reminderAt,
      idempotencyKey: `waitlist-confirm-reminder/${tokenHash}`,
    });

    if (!scheduled.ok) {
      // The confirmation mail already exists and works. A reminder is useful,
      // but its temporary failure must not pretend the whole signup failed.
      console.error("[waitlist] reminder scheduling failed", {
        reason: scheduled.reason,
      });
    }

    // Only now does the resend throttle start. Store the scheduled message id
    // so confirmation can cancel it before it is delivered.
    const { data: markData, error: markError } = await client.rpc(
      "waitlist_mark_confirmation_delivery",
      {
        p_token_hash: tokenHash,
        p_reminder_email_id: scheduled.ok ? scheduled.id : null,
        p_reminder_scheduled_at: scheduled.ok ? reminderAt : null,
      },
    );
    if (markError || markData !== "recorded") {
      // The mail is out and the link works. The only cost is that a quick
      // second submission could produce a duplicate mail. Cancel the reminder
      // because the database would otherwise be unable to cancel it later.
      console.error("[waitlist] could not record delivery", {
        code: markError?.code ?? "unexpected_result",
      });
      if (scheduled.ok) await cancelScheduledMail(scheduled.id);
    }

    return { status: "success" };
  } catch (cause) {
    console.error("[waitlist] unexpected failure", {
      message: cause instanceof Error ? cause.message : "unknown",
    });
    return UNKNOWN;
  }
}
