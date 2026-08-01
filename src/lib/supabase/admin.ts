import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { createClient } from "./server";

/**
 * Returns a Supabase client with full admin privileges (bypasses RLS).
 *
 * Uses the SUPABASE_SERVICE_ROLE_KEY when available (production / staging).
 * Falls back to the regular SSR client in local dev when no service key is set.
 *
 * ⚠️  ONLY use this in Server Components and Server Actions.
 *     Never pass this client or its key to the browser.
 */
export async function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  if (serviceRoleKey) {
    return createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
      auth: {
        // Disable auto-refresh — this is a server-only client
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // Fallback for local development without a service role key.
  // RLS will apply in this mode.
  console.warn(
    "[admin] SUPABASE_SERVICE_ROLE_KEY not set — falling back to anon client. RLS will apply."
  );
  return await createClient();
}
