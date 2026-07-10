import "server-only";
import { db } from "@/lib/db";
import type { TenantScope } from "./types";
import type { CommercialProfileInput } from "./commercial-profile.schema";
import type { UserProfileInput } from "./user-profile.schema";

/**
 * The first real query to go through the tenant-scoped pattern (MVP_BACKLOG.md
 * Sprint 0 DoD) — every field access is filtered by `scope.tenantId`, the shape
 * every future module's repository functions should follow.
 */
export async function listTenantMembers(scope: TenantScope) {
  return db.user.findMany({
    where: { tenantId: scope.tenantId },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * CommercialProfile is modeled 1:1 with Tenant (DATA_MODEL.md §3.3) — the MVP's
 * single consultant's value proposition/tone, used as an input to every AI draft.
 */
export function getCommercialProfile(scope: TenantScope) {
  return db.commercialProfile.findUnique({
    where: { tenantId: scope.tenantId },
  });
}

export function upsertCommercialProfile(
  scope: TenantScope,
  data: CommercialProfileInput,
) {
  return db.commercialProfile.upsert({
    where: { tenantId: scope.tenantId },
    create: { tenantId: scope.tenantId, ...data },
    update: data,
  });
}

/**
 * Updates the current user's own display name (User.name) — distinct from
 * CommercialProfile, which holds business/AI-drafting context, not identity.
 * `userId` always comes from the authenticated session (never user-supplied),
 * but the tenant-scoped lookup is kept anyway so this can never silently
 * update a row outside the caller's own tenant.
 */
export async function updateUserName(
  scope: TenantScope,
  userId: string,
  data: UserProfileInput,
) {
  const existing = await db.user.findFirst({
    where: { id: userId, tenantId: scope.tenantId },
  });
  if (!existing) return null;

  return db.user.update({ where: { id: userId }, data: { name: data.name } });
}
