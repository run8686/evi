/**
 * Result shape of the waitlist submission.
 *
 * Kept out of actions.ts on purpose: a `"use server"` module may only export
 * async functions, so a plain object constant living there crashes the route at
 * module evaluation.
 */
export type WaitlistState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      /** Machine-readable reason, also used as an analytics property. */
      code: "invalid_email" | "unavailable" | "unknown";
      /** Message shown to the person, in German. */
      message: string;
    };

export const WAITLIST_INITIAL_STATE: WaitlistState = { status: "idle" };
