import "server-only";
import { db } from "@/lib/db";
import type { LeadSourceType, LeadStatus, Momentum } from "@/generated/prisma/enums";
import type { TenantScope } from "@/modules/tenancy/types";
import type { LeadFieldsInput } from "./lead.schema";
import type { LeadFilters } from "./types";

/**
 * Every function here takes an explicit TenantScope and filters by it
 * (ARCHITECTURE.md §5) — this is the module's one seam into the database for
 * Lead data. No other module should query the `Lead` table directly.
 */

export function createLead(
  scope: TenantScope,
  data: LeadFieldsInput & { sourceType: LeadSourceType },
) {
  return db.lead.create({
    data: { ...data, tenantId: scope.tenantId },
  });
}

export function listLeads(scope: TenantScope, filters: LeadFilters = {}) {
  return db.lead.findMany({
    where: {
      tenantId: scope.tenantId,
      deletedAt: null,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.niche ? { niche: filters.niche } : {}),
      ...(filters.search
        ? { name: { contains: filters.search, mode: "insensitive" } }
        : {}),
    },
    orderBy: { lastActivityAt: "desc" },
  });
}

/** Returns null both when the Lead doesn't exist and when it belongs to another tenant. */
export function getLead(scope: TenantScope, id: string) {
  return db.lead.findFirst({
    where: { id, tenantId: scope.tenantId, deletedAt: null },
  });
}

export async function updateLead(
  scope: TenantScope,
  id: string,
  data: Partial<LeadFieldsInput>,
) {
  const existing = await getLead(scope, id);
  if (!existing) return null;

  return db.lead.update({ where: { id }, data });
}

/**
 * Soft delete only (DATA_MODEL.md §6) — `deletedAt` is an infra-level safety
 * net, invisible to the product. Every read above already filters it out, so
 * this is permanent from the user's perspective (PRD FR-1.3) even though the
 * row isn't purged until a future background job does so.
 */
export async function softDeleteLead(scope: TenantScope, id: string) {
  const existing = await getLead(scope, id);
  if (!existing) return null;

  return db.lead.update({ where: { id }, data: { deletedAt: new Date() } });
}

/**
 * Narrow write used by the Outreach module (ARCHITECTURE.md §2) to apply
 * status transitions and Momentum recomputation — Prospecting keeps sole
 * ownership of writes to the `Lead` table (no other module calls `db.lead.*`
 * directly), while Outreach owns the *decision* of what the new values are.
 */
export async function updateLeadState(
  scope: TenantScope,
  id: string,
  data: Partial<{ status: LeadStatus; momentum: Momentum; lastActivityAt: Date }>,
) {
  const existing = await getLead(scope, id);
  if (!existing) return null;

  return db.lead.update({ where: { id }, data });
}
