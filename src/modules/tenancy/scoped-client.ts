import { db } from "@/lib/db";
import type { TenantScope } from "./types";

/**
 * The single seam every tenant-scoped query must pass through (ARCHITECTURE.md §5,
 * DECISIONS.md "Why Multi-Tenant From Day One"). Other modules' repository functions
 * take a `TenantScope` and use `scope.tenantId` in their Prisma `where` clause —
 * never a raw `db` call against a tenant-scoped table without one.
 */
export function scopeToTenant(tenantId: string): TenantScope {
  return { tenantId };
}

export { db };
