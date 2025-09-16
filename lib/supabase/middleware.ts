import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Supabase middleware to refresh the user's session.
 * This function creates a Supabase middleware client and attempts to get the user's session,
 * ensuring that the session is fresh for subsequent requests.
 * @param {NextRequest} request - The incoming Next.js request.
 * @returns {NextResponse} The Next.js response, potentially with updated session cookies.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next(); // Create a new response object.
  // Create a Supabase client specifically for middleware, using the request and response.
  const supabase = createMiddlewareClient({ req: request, res: response });
  // Attempt to get the user's session, which refreshes the session if needed.
  await supabase.auth.getSession();
  return response; // Return the response with potentially updated session cookies.
}