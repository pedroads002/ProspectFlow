import "server-only";
import { db } from "@/lib/db";
import type { TenantScope } from "@/modules/tenancy/types";
import type { MessageKind, Channel } from "@/generated/prisma/enums";

/**
 * Tenant-scoped access to `OutboundMessage` (DATA_MODEL.md §3.6) — every
 * function takes a TenantScope, matching the pattern in prospecting/lead.repository.ts.
 */

export function createDraftMessage(
  scope: TenantScope,
  data: {
    leadId: string;
    kind: MessageKind;
    channel: Channel;
    content: string;
    aiGenerated: boolean;
  },
) {
  return db.outboundMessage.create({
    data: { ...data, tenantId: scope.tenantId },
  });
}

export function getMessage(scope: TenantScope, id: string) {
  return db.outboundMessage.findFirst({
    where: { id, tenantId: scope.tenantId },
  });
}

export function listMessagesForLead(scope: TenantScope, leadId: string) {
  return db.outboundMessage.findMany({
    where: { leadId, tenantId: scope.tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateMessageContent(
  scope: TenantScope,
  id: string,
  content: string,
) {
  const existing = await getMessage(scope, id);
  if (!existing) return null;

  return db.outboundMessage.update({ where: { id }, data: { content } });
}

/** Marking as sent is a distinct, explicit action from drafting (PRD business rule #3). */
export async function markMessageSent(scope: TenantScope, id: string) {
  const existing = await getMessage(scope, id);
  if (!existing) return null;

  return db.outboundMessage.update({
    where: { id },
    data: { status: "SENT", sentAt: new Date() },
  });
}
