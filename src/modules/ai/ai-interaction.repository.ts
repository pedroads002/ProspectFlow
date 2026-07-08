import "server-only";
import { db } from "@/lib/db";
import type { TenantScope } from "@/modules/tenancy/types";
import type { AITaskType } from "@/generated/prisma/enums";

/**
 * Audit log for every AI call (DATA_MODEL.md §3.8) — logged by ai.service.ts
 * itself after each successful call, so no caller can forget to record one.
 */
export function logInteraction(
  scope: TenantScope,
  data: {
    leadId: string;
    taskType: AITaskType;
    provider: string;
    model: string;
    inputSnapshot: string;
    outputContent: string;
  },
) {
  return db.aIInteraction.create({
    data: { ...data, tenantId: scope.tenantId },
  });
}

export function listInteractionsForLead(scope: TenantScope, leadId: string) {
  return db.aIInteraction.findMany({
    where: { leadId, tenantId: scope.tenantId },
    orderBy: { createdAt: "desc" },
  });
}
