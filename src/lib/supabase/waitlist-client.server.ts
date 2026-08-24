import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client for waitlist inserts.
 *
 * Server-only on purpose. The credentials are read from non-`NEXT_PUBLIC_`
 * variables so nothing Supabase-related is ever bundled into client JS, and
 * the key used is the anon key, which row-level security restricts to INSERT
 * on one table (see supabase/migrations/0001_create_waitlist_signups.sql).
 * The service-role key is never needed by this app and must not be added.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export const WAITLIST_TABLE = "waitlist_signups";

export function isWaitlistConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let cached: SupabaseClient | null = null;

/**
 * Returns the client, or null when the environment is not configured. Callers
 * must handle null and surface a real error — there is no offline fallback and
 * no pretend success, because a signup that was not stored is not a signup.
 */
export function getWaitlistClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (cached) return cached;

  // No auth session is involved: this client only appends anonymous rows.
  cached = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: { "x-application-name": "evi-landingpage" },
    },
  });

  return cached;
}
