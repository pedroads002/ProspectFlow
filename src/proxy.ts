import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 renamed Middleware to Proxy (same mechanism, new file name/export).
 * This refreshes the Supabase session on every navigation, which is what makes
 * `setAll` failures safe to ignore in Server Components (see lib/supabase/server.ts).
 * It also performs the optimistic redirect for unauthenticated dashboard access —
 * the real authorization check still happens server-side per PRD/ARCHITECTURE.md §5-6.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not add logic between createServerClient and getUser() — see @supabase/ssr docs.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The whole app is the authenticated product in the MVP (PRD/VISION.md) — there is
  // no separate public marketing site, so everything except the auth routes themselves
  // is protected.
  const publicRoutes = ["/sign-in", "/sign-up"];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
