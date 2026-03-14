import { createClient } from '@supabase/supabase-js';

/**
 * Supabase URL and Anon Key are injected via environment variables.
 * In Expo, these are exposed through app.config.ts / .env using the
 * EXPO_PUBLIC_ prefix so they are available at runtime on the client.
 *
 * Set the following in your .env file:
 *   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is not set. ' +
      'Auth and database features will not work.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Must be false for React Native / Expo
  },
});

export type { Session, User, AuthError } from '@supabase/supabase-js';
