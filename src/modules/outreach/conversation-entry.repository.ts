import "server-only";
import { db } from "@/lib/db";
import type { TenantScope } from "@/modules/tenancy/types";

/**
 * Tenant-scoped access to `ConversationEntry` (DATA_MODEL.md §3.7) — raw
 * pasted conversation text, stored so future AI assistance has continuity
 * (PRD FR-4.5, FR-2.2(d)).
 */
export function createEntry(scope: TenantScope, leadId: string, rawText: string) {
  return db.conversationEntry.create({
    data: { leadId, tenantId: scope.tenantId, rawText },
  });
}

export function listEntriesForLead(scope: TenantScope, leadId: string) {
  return db.conversationEntry.findMany({
    where: { leadId, tenantId: scope.tenantId },
    orderBy: { pastedAt: "asc" },
  });
}
