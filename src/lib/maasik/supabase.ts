import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client using the service-role key.
 * NEVER expose this client to the browser.
 * Reuse across invocations within the same Vercel container (warm starts).
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase env vars not set');
  }

  cachedClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return cachedClient;
}
