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

/** Powers the Painel do Dia's daily counters (WORKFLOW.md §4) — events of one
 * type (optionally narrowed to a `toStatus`, e.g. STATUS_CHANGED → REPLIED)
 * logged within a given range. */
export function countEventsInRange(
  scope: TenantScope,
  range: { start: Date; end: Date; type: LeadEventType; toStatus?: LeadStatus },
) {
  return db.leadEvent.count({
    where: {
      tenantId: scope.tenantId,
      type: range.type,
      ...(range.toStatus ? { toStatus: range.toStatus } : {}),
      createdAt: { gte: range.start, lt: range.end },
    },
  });
}
