import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Always create a new client per request/render — never share across requests.
 * `setAll` can fail when called from a Server Component (cookies are read-only
 * there); that failure is safe to ignore because `proxy.ts` already refreshes
 * the session on every navigation (see comment in that file).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore (see proxy.ts).
          }
        },
      },
    },
  );
}
