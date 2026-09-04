import {
  getWaitlistClient,
  isWaitlistConfigured,
  WAITLIST_TABLE,
} from "@/lib/supabase/waitlist-client.server";

/**
 * Keeps the Supabase project awake, and says so loudly when it is not.
 *
 * Free Supabase projects pause after about a week without requests. The
 * landing page runs on Vercel and stays up regardless, so the database only
 * sees traffic when somebody signs up — which means the quiet period right
 * after launch is exactly when it pauses, and the first real signup after that
 * is the one that fails. This runs daily so that never happens.
 *
 * It doubles as monitoring: a non-2xx answer here shows up in the Vercel cron
 * log, which is the difference between noticing a broken signup path and
 * finding out because nobody signed up for two weeks.
 *
 * Reads nothing and writes nothing. Row-level security denies the select, so
 * the query reaches Postgres, gets refused, and comes back empty — which is
 * all that is needed to count as activity.
 */

/** A run that hangs is a run that tells us nothing. */
const TIMEOUT_MS = 10_000;

export async function GET(request: Request): Promise<Response> {
  // Vercel attaches this header to scheduled invocations when CRON_SECRET is
  // set. Without the check the endpoint is a public button that anybody can
  // hold down.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authorization = request.headers.get("authorization");
    if (authorization !== `Bearer ${secret}`) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
  } else {
    // Fail closed rather than quietly serving an unauthenticated endpoint.
    console.error("[keep-alive] CRON_SECRET is not set — refusing to run.");
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  if (!isWaitlistConfigured()) {
    console.error("[keep-alive] Supabase is not configured.");
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const client = getWaitlistClient();
  if (!client) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  try {
    const { error } = await client
      .from(WAITLIST_TABLE)
      .select("email")
      .limit(1)
      .abortSignal(AbortSignal.timeout(TIMEOUT_MS));

    // This query is expected to reach Postgres and fail with 42501 because the
    // anon role deliberately has no SELECT privilege. Every other error (bad
    // key, missing table, gateway failure, etc.) means the check is not healthy.
    if (error && error.code !== "42501") {
      console.error("[keep-alive] database check failed", {
        code: error.code || "transport",
        message: error.message,
      });
      return Response.json({ error: "unreachable" }, { status: 503 });
    }

    return Response.json({ ok: true });
  } catch (cause) {
    console.error("[keep-alive] failed", {
      message: cause instanceof Error ? cause.message : "unknown",
    });
    return Response.json({ error: "unreachable" }, { status: 503 });
  }
}
