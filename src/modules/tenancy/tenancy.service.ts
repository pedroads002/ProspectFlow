import "server-only";
import { db } from "@/lib/db";
import type { TenantScope } from "./types";

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
