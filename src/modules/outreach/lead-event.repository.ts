import "server-only";
import { db } from "@/lib/db";
import type { LeadStatus, LeadEventType } from "@/generated/prisma/enums";
import type { TenantScope } from "@/modules/tenancy/types";

/**
 * The append-only timeline (DATA_MODEL.md §3.5) that both the Lead detail
 * timeline and Momentum computation read from. Never updated or deleted.
 */
export function logEvent(
  scope: TenantScope,
  data: {
    leadId: string;
    type: LeadEventType;
    fromStatus?: LeadStatus;
    toStatus?: LeadStatus;
  },
) {
  return db.leadEvent.create({
    data: { ...data, tenantId: scope.tenantId },
  });
}

export function getLatestEvent(scope: TenantScope, leadId: string) {
  return db.leadEvent.findFirst({
    where: { leadId, tenantId: scope.tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export function listEvents(scope: TenantScope, leadId: string) {
  return db.leadEvent.findMany({
    where: { leadId, tenantId: scope.tenantId },
    orderBy: { createdAt: "desc" },
  });
}
