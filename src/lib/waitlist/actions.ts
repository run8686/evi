"use server";

import {
  getWaitlistClient,
  isWaitlistConfigured,
  WAITLIST_TABLE,
} from "@/lib/supabase/waitlist-client.server";
import {
  normalizeAttributionValue,
  normalizeFirstName,
  validateEmail,
} from "./validation";
import { SITE } from "@/lib/constants";
import type { WaitlistState } from "./state";

/** Postgres unique-violation. Someone signed up twice — that is not a failure. */
const UNIQUE_VIOLATION = "23505";

const EMAIL_ERRORS: Record<string, string> = {
  missing: "Bitte gib deine E-Mail-Adresse ein.",
  too_long: "Diese E-Mail-Adresse ist zu lang.",
  invalid: "Diese E-Mail-Adresse sieht nicht ganz richtig aus.",
};

/**
 * Adds someone to the Early Access waitlist.
 *
 * Stores an e-mail address, an optional first name and where the visit came
 * from. Never stores anything about a person's mental health — the form does
 * not ask, and this function would have nowhere to put it.
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

  if (!isWaitlistConfigured()) {
    // The environment is missing its Supabase credentials. Say so plainly
    // rather than showing a success screen for a signup that went nowhere.
    console.error(
      "[waitlist] SUPABASE_URL or SUPABASE_ANON_KEY is not set — signup rejected.",
    );
    return {
      status: "error",
      code: "unavailable",
      message:
        "Die Warteliste ist gerade nicht erreichbar. Bitte versuch es später noch einmal.",
    };
  }

  const client = getWaitlistClient();
  if (!client) {
    return {
      status: "error",
      code: "unavailable",
      message:
        "Die Warteliste ist gerade nicht erreichbar. Bitte versuch es später noch einmal.",
    };
  }

  const row = {
    email: emailResult.email,
    first_name: normalizeFirstName(formData.get("first_name")),
    locale: SITE.locale,
    utm_source: normalizeAttributionValue(formData.get("utm_source")),
    utm_medium: normalizeAttributionValue(formData.get("utm_medium")),
    utm_campaign: normalizeAttributionValue(formData.get("utm_campaign")),
    utm_content: normalizeAttributionValue(formData.get("utm_content")),
    utm_term: normalizeAttributionValue(formData.get("utm_term")),
    referrer: normalizeAttributionValue(formData.get("referrer")),
    // Checkbox: present only when actively ticked. Never defaulted to true.
    marketing_consent: formData.get("marketing_consent") === "on",
  };

  try {
    // No .select() — row-level security grants INSERT only, so asking for the
    // row back would fail.
    const { error } = await client.from(WAITLIST_TABLE).insert(row);

    if (error) {
      if (error.code === UNIQUE_VIOLATION) {
        // Already on the list. Same confirmation as a first-time signup: we
        // don't reveal whether an address is already registered.
        return { status: "success" };
      }

      // Log the reason, never the address.
      console.error("[waitlist] insert failed", {
        code: error.code,
        message: error.message,
      });
      return {
        status: "error",
        code: "unknown",
        message:
          "Das hat gerade nicht funktioniert. Bitte versuch es noch einmal.",
      };
    }

    return { status: "success" };
  } catch (cause) {
    console.error("[waitlist] unexpected failure", {
      message: cause instanceof Error ? cause.message : "unknown",
    });
    return {
      status: "error",
      code: "unknown",
      message:
        "Das hat gerade nicht funktioniert. Bitte versuch es noch einmal.",
    };
  }
}
