"use server";

import { redirect } from "next/navigation";

import { getWaitlistClient } from "@/lib/supabase/waitlist-client.server";
import { hashToken } from "./tokens.server";
import { UNSUBSCRIBE_PATH } from "@/lib/mail/templates/confirm-waitlist";

/**
 * Removes an address from the waitlist.
 *
 * Deletes the row outright. There is nothing worth keeping: it existed only to
 * send one invitation, and a suppression list of people who asked to be
 * forgotten would be its own privacy problem.
 *
 * Behind a POST for the same reason as the confirmation: mail scanners fetch
 * every link in a message before anyone reads it, and a GET that deleted rows
 * would let a security gateway silently remove people from the list.
 */
export async function unsubscribeFromWaitlist(
  formData: FormData,
): Promise<void> {
  const token = formData.get("token");
  let outcome = "not_listed";

  if (typeof token === "string" && token.length > 0) {
    const client = getWaitlistClient();

    if (!client) {
      console.error("[waitlist] unsubscribe attempted without configuration");
      outcome = "unavailable";
    } else {
      try {
        const { data, error } = await client.rpc("waitlist_unsubscribe", {
          p_token_hash: hashToken(token),
        });

        if (error) {
          console.error("[waitlist] unsubscribe failed", { code: error.code });
          outcome = "unavailable";
        } else {
          // 'removed' | 'not_listed' | 'invalid'
          outcome = data === "removed" ? "removed" : "not_listed";
        }
      } catch (cause) {
        console.error("[waitlist] unsubscribe crashed", {
          message: cause instanceof Error ? cause.message : "unknown",
        });
        outcome = "unavailable";
      }
    }
  }

  redirect(`${UNSUBSCRIBE_PATH}?status=${outcome}`);
}
