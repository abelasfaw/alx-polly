import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

/**
 * Creates a Supabase client for server-side operations.
 * This client is configured to use cookies for authentication, handling base64 encoded tokens.
 * @returns {SupabaseClient} A Supabase client instance.
 */
export function createClient() {
  const cookieStore = cookies(); // Access the Next.js cookies store.

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * Retrieves a cookie by name.
         * Decodes base64 encoded access tokens if present.
         * @param {string} name - The name of the cookie to retrieve.
         * @returns {string | undefined} The cookie value, or undefined if not found.
         */
        get(name: string) {
          const value = cookieStore.get(name)?.value;
          // Special handling for base64 encoded access tokens.
          if (name === 'sb-access-token' && value && value.startsWith('base64-')) {
            try {
              return atob(value.substring(7)); // Decode the base64 token.
            } catch (e) {
              console.error('Failed to decode base64 cookie in server.ts:', e);
              return undefined;
            }
          }
          return value;
        },
        /**
         * Sets a cookie with the given name, value, and options.
         * @param {string} name - The name of the cookie to set.
         * @param {string} value - The value of the cookie.
         * @param {CookieOptions} options - The options for the cookie.
         */
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        /**
         * Removes a cookie by name.
         * @param {string} name - The name of the cookie to remove.
         * @param {CookieOptions} options - The options for the cookie.
         */
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}