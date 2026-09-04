"use server";

import { redirect } from "next/navigation";

import { cancelScheduledMail, sendMail } from "@/lib/mail/send.server";
import { confirmedWaitlistMail } from "@/lib/mail/templates/confirmed-waitlist";
import { getWaitlistClient } from "@/lib/supabase/waitlist-client.server";
import { hashToken } from "./tokens.server";
import { CONFIRM_PATH } from "@/lib/mail/templates/confirm-waitlist";

type ConfirmReceiptRow = {
  result: string;
  recipient_email: string | null;
  should_send_receipt: boolean;
  reminder_email_id: string | null;
};

function readReceiptRow(value: unknown): ConfirmReceiptRow | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const row: unknown = value[0];
  if (!row || typeof row !== "object") return null;

  const candidate = row as Record<string, unknown>;
  if (
    typeof candidate.result !== "string" ||
    (candidate.recipient_email !== null &&
      typeof candidate.recipient_email !== "string") ||
    typeof candidate.should_send_receipt !== "boolean" ||
    (candidate.reminder_email_id !== null &&
      typeof candidate.reminder_email_id !== "string")
  ) {
    return null;
  }

  return {
    result: candidate.result,
    recipient_email: candidate.recipient_email,
    should_send_receipt: candidate.should_send_receipt,
    reminder_email_id: candidate.reminder_email_id,
  };
}

/**
 * Completes a double opt-in.
 *
 * Reachable only by submitting the form on the confirmation page, never by
 * following the link itself. Mail security scanners — Outlook Safe Links,
 * corporate gateways — fetch every URL in an incoming message before the
 * recipient sees it. If the link confirmed on its own, those fetches would
 * confirm signups nobody agreed to, which is precisely the thing double opt-in
 * exists to prevent.
 *
 * Redirects afterwards so the token disappears from the address bar, the
 * browser history and any Referer header, and so a reload cannot resubmit.
 */
export async function confirmWaitlist(formData: FormData): Promise<void> {
  const token = formData.get("token");
  let outcome = "invalid";

  if (typeof token === "string" && token.length > 0) {
    const client = getWaitlistClient();

    if (!client) {
      console.error("[waitlist] confirm attempted without configuration");
      outcome = "unavailable";
    } else {
      try {
        const tokenHash = hashToken(token);
        const { data, error } = await client.rpc(
          "waitlist_confirm_with_receipt_v2",
          {
            p_token_hash: tokenHash,
          },
        );

        if (error) {
          console.error("[waitlist] confirm failed", { code: error.code });
          outcome = "unavailable";
        } else {
          const receipt = readReceiptRow(data);
          outcome = receipt?.result ?? "invalid";

          if (
            receipt?.reminder_email_id &&
            (outcome === "confirmed" || outcome === "already")
          ) {
            const cancelled = await cancelScheduledMail(
              receipt.reminder_email_id,
            );
            if (cancelled.ok) {
              const { error: cancelMarkError } = await client.rpc(
                "waitlist_mark_reminder_cancelled",
                {
                  p_token_hash: tokenHash,
                  p_reminder_email_id: receipt.reminder_email_id,
                },
              );
              if (cancelMarkError) {
                console.error(
                  "[waitlist] could not record reminder cancellation",
                  { code: cancelMarkError.code },
                );
              }
            } else {
              // A reminder that already went out cannot be cancelled. That is
              // expected when somebody confirms after the 24-hour reminder.
              console.error("[waitlist] reminder cancellation skipped", {
                reason: cancelled.reason,
              });
            }
          }

          if (
            receipt?.should_send_receipt &&
            receipt.recipient_email &&
            (outcome === "confirmed" || outcome === "already")
          ) {
            const mail = confirmedWaitlistMail();
            const sent = await sendMail({
              to: receipt.recipient_email,
              subject: mail.subject,
              html: mail.html,
              text: mail.text,
              idempotencyKey: `waitlist-confirmed/${tokenHash}`,
            });

            if (sent.ok) {
              const { data: markData, error: markError } = await client.rpc(
                "waitlist_mark_receipt_delivered",
                { p_token_hash: tokenHash },
              );
              if (
                markError ||
                (markData !== "recorded" && markData !== "already")
              ) {
                console.error(
                  "[waitlist] could not record confirmation receipt delivery",
                  { code: markError?.code ?? "unexpected_result" },
                );
              }
            } else {
              // Confirmation itself succeeded. The original confirmation link
              // can be submitted again to retry this receipt without changing
              // the waitlist state or sending duplicates after an API timeout.
              console.error("[waitlist] confirmation receipt failed", {
                reason: sent.reason,
              });
            }
          }
        }
      } catch (cause) {
        console.error("[waitlist] confirm crashed", {
          message: cause instanceof Error ? cause.message : "unknown",
        });
        outcome = "unavailable";
      }
    }
  }

  redirect(`${CONFIRM_PATH}?status=${outcome}`);
}
