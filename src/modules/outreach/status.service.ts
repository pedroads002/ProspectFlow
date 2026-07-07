import "server-only";
import type { LeadStatus, LeadEventType } from "@/generated/prisma/enums";
import type { TenantScope } from "@/modules/tenancy/types";
import * as prospectingService from "@/modules/prospecting/lead.service";
import * as leadEventRepository from "./lead-event.repository";
import * as momentumService from "./momentum.service";
import type { QuickAction } from "./types";

const NON_TERMINAL_STATUSES: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "REPLIED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
];

const POST_CONTACT_STATUSES: LeadStatus[] = [
  "CONTACTED",
  "REPLIED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
];

/**
 * The Quick Action → status transition table (PRD §1.2, §7.1). Kept as one
 * declarative map so the allowed transitions are visible at a glance and
 * can't drift from the PRD without the diff being obvious in review.
 */
const QUICK_ACTION_RULES: Record<
  QuickAction,
  { allowedFrom: LeadStatus[]; toStatus?: LeadStatus; eventType: LeadEventType }
> = {
  NO_REPLY: {
    allowedFrom: ["CONTACTED"],
    eventType: "NO_REPLY_LOGGED",
  },
  REPLIED: {
    allowedFrom: ["CONTACTED"],
    toStatus: "REPLIED",
    eventType: "STATUS_CHANGED",
  },
  INTERESTED: {
    allowedFrom: ["REPLIED"],
    toStatus: "QUALIFIED",
    eventType: "STATUS_CHANGED",
  },
  FOLLOW_UP: {
    allowedFrom: POST_CONTACT_STATUSES,
    eventType: "FOLLOW_UP_LOGGED",
  },
  MEETING_SCHEDULED: {
    allowedFrom: ["QUALIFIED", "PROPOSAL_SENT"],
    toStatus: "NEGOTIATION",
    eventType: "STATUS_CHANGED",
  },
  SALE_COMPLETED: {
    allowedFrom: NON_TERMINAL_STATUSES,
    toStatus: "SALE_COMPLETED",
    eventType: "STATUS_CHANGED",
  },
  LOST: {
    allowedFrom: NON_TERMINAL_STATUSES,
    toStatus: "LOST",
    eventType: "STATUS_CHANGED",
  },
};

/** Which Quick Action buttons the UI should show for a Lead's current status. */
export function getAvailableQuickActions(status: LeadStatus): QuickAction[] {
  return (Object.keys(QUICK_ACTION_RULES) as QuickAction[]).filter((action) =>
    QUICK_ACTION_RULES[action].allowedFrom.includes(status),
  );
}

/**
 * Applies a Quick Action: validates the transition, updates status (if the
 * action changes it) and `lastActivityAt`, logs the LeadEvent, and refreshes
 * Momentum — the single path every Quick Action button goes through.
 */
export async function applyQuickAction(
  scope: TenantScope,
  leadId: string,
  action: QuickAction,
) {
  const lead = await prospectingService.getLead(scope, leadId);
  if (!lead) return null;

  const rule = QUICK_ACTION_RULES[action];
  if (!rule.allowedFrom.includes(lead.status)) {
    throw new Error(
      `Quick action "${action}" is not valid from status "${lead.status}".`,
    );
  }

  await leadEventRepository.logEvent(scope, {
    leadId,
    type: rule.eventType,
    ...(rule.toStatus
      ? { fromStatus: lead.status, toStatus: rule.toStatus }
      : {}),
  });

  const updated = await prospectingService.updateLeadState(scope, leadId, {
    status: rule.toStatus ?? lead.status,
    lastActivityAt: new Date(),
  });
  if (!updated) return null;

  return momentumService.refreshLeadMomentum(scope, updated);
}
