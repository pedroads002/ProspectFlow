import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import type { AuthenticatedContext } from "./types";

/**
 * Verifies the session against the Supabase Auth server (never trusts a cookie
 * alone — see @supabase/ssr's getUser() vs getSession() distinction). Memoized
 * per request with React's `cache` so multiple calls in one render don't cost
 * multiple network round-trips (same pattern as Next.js's own DAL guide).
 */
export const getAuthenticatedSupabaseUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * First sign-in for a Supabase user creates their Tenant + User (role OWNER) —
 * see PRD FR-7 and DECISIONS.md "Why Multi-Tenant From Day One". Deliberately
 * lazy (no auth webhook/trigger): the first authenticated request that needs a
 * tenant creates one, which is the simplest mechanism that satisfies the
 * requirement (VISION.md's "simplicity over complexity" principle).
 */
async function ensureTenantAndUser(supabaseUser: {
  id: string;
  email?: string;
}): Promise<AuthenticatedContext> {
  const existing = await db.user.findUnique({
    where: { supabaseUserId: supabaseUser.id },
    include: { tenant: true },
  });

  if (existing) {
    return { tenant: existing.tenant, user: existing };
  }

  const email = supabaseUser.email ?? "";
  const tenantName = email ? `${email.split("@")[0]}'s Workspace` : "My Workspace";

  const tenant = await db.tenant.create({
    data: {
      name: tenantName,
      users: {
        create: {
          supabaseUserId: supabaseUser.id,
          email,
          role: "OWNER",
        },
      },
    },
    include: { users: true },
  });

  return { tenant, user: tenant.users[0] };
}

/**
 * Main entry point for server-side pages/actions: resolves the authenticated
 * user's Tenant + User, redirecting to sign-in if there's no valid session.
 * Every module that needs "who is the current user/tenant" should call this
 * rather than reaching into Supabase or Prisma directly.
 */
export const getCurrentTenantUser = cache(
  async (): Promise<AuthenticatedContext> => {
    const supabaseUser = await getAuthenticatedSupabaseUser();

    if (!supabaseUser) {
      redirect("/sign-in");
    }

    return ensureTenantAndUser(supabaseUser);
  },
);
