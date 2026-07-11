import "server-only";
import type { Lead } from "@/modules/prospecting/types";
import type { TenantScope } from "@/modules/tenancy/types";
import * as leadEventRepository from "./lead-event.repository";
import * as prospectingService from "@/modules/prospecting/lead.service";
import type { LeadStatus, Momentum, LeadEventType } from "@/generated/prisma/enums";

/**
 * Default expected-response windows per stage (PRD §1.4) — MVP defaults, not
 * yet tenant-configurable. Statuses absent here (NEW, SALE_COMPLETED, LOST)
 * don't carry an urgency window: NEW hasn't started the clock, and the
 * terminal statuses are outside the "needs attention" concern entirely.
 */
const EXPECTED_WINDOW_DAYS: Partial<Record<LeadStatus, number>> = {
  CONTACTED: 5,
  REPLIED: 3,
  QUALIFIED: 7,
  PROPOSAL_SENT: 7,
  NEGOTIATION: 14,
};

const FORWARD_EVENT_TYPES: LeadEventType[] = ["STATUS_CHANGED", "MESSAGE_SENT"];

/**
 * Pure computation (PRD §1.4) — deliberately rule-based, not AI-computed
 * (DECISIONS.md "Why Momentum Is Rule-Based, Not AI-Computed, in the MVP"),
 * so it's instant, free, and fully explainable.
 */
export function computeMomentum(input: {
  status: LeadStatus;
  lastActivityAt: Date;
  lastEventType?: LeadEventType;
  now?: Date;
}): Momentum {
  const { status, lastActivityAt, lastEventType, now = new Date() } = input;

  const expectedWindowDays = EXPECTED_WINDOW_DAYS[status];
  if (!expectedWindowDays) {
    // NEW, SALE_COMPLETED, LOST: no urgency window applies.
    return "STEADY";
  }

  const daysSinceActivity =
    (now.getTime() - lastActivityAt.getTime()) / (1000 * 60 * 60 * 24);

  const isForwardMovement =
    !!lastEventType && FORWARD_EVENT_TYPES.includes(lastEventType);

  if (isForwardMovement && daysSinceActivity <= expectedWindowDays) {
    return "RISING";
  }
  if (daysSinceActivity > expectedWindowDays * 2) {
    return "STALLED";
  }
  if (daysSinceActivity > expectedWindowDays) {
    return "COOLING";
  }
  return "STEADY";
}

/**
 * Recalculates Momentum for one Lead and persists it if it changed
 * (PRD §1.4: "recalculated whenever a lead is viewed or updated"). Returns
 * the Lead with the freshly computed value even before/without a write,
 * so callers always render the current truth.
 */
export async function refreshLeadMomentum(
  scope: TenantScope,
  lead: Lead,
): Promise<Lead> {
  const latestEvent = await leadEventRepository.getLatestEvent(scope, lead.id);
  const momentum = computeMomentum({
    status: lead.status,
    lastActivityAt: lead.lastActivityAt,
    lastEventType: latestEvent?.type,
  });

  if (momentum === lead.momentum) {
    return lead;
  }

  const updated = await prospectingService.updateLeadState(scope, lead.id, {
    momentum,
  });
  return updated ?? { ...lead, momentum };
}

export async function refreshLeadsMomentum(
  scope: TenantScope,
  leads: Lead[],
): Promise<Lead[]> {
  return Promise.all(leads.map((lead) => refreshLeadMomentum(scope, lead)));
}

/** Most-urgent-first — the ordering that lets a user open the Lead list and
 * immediately see who needs attention (VISION.md's MVP Vision). */
const MOMENTUM_PRIORITY: Record<Momentum, number> = {
  STALLED: 0,
  COOLING: 1,
  RISING: 2,
  STEADY: 3,
};

export function sortByMomentumPriority(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => {
    const priorityDiff =
      MOMENTUM_PRIORITY[a.momentum] - MOMENTUM_PRIORITY[b.momentum];
    if (priorityDiff !== 0) return priorityDiff;
    return b.lastActivityAt.getTime() - a.lastActivityAt.getTime();
  });
}

/**
 * Powers the Painel do Dia's "quem precisa de mim agora" queue (WORKFLOW.md
 * §3.1) — rule-based today (DECISIONS.md "Why Momentum Is Rule-Based"), and
 * the deliberate swap point for a future AI-ranked priority queue (VISION.md
 * "Execution & Design Principles": AI woven in, not bolted on). Callers depend
 * only on this function's shape, so replacing the ranking logic later never
 * touches the dashboard page. Terminal leads (won/lost) never need attention.
 */
export async function getPriorityLeads(
  scope: TenantScope,
  options: { limit?: number } = {},
): Promise<Lead[]> {
  const leads = await prospectingService.listLeads(scope);
  const active = leads.filter(
    (lead) => lead.status !== "SALE_COMPLETED" && lead.status !== "LOST",
  );
  const fresh = await refreshLeadsMomentum(scope, active);
  const sorted = sortByMomentumPriority(fresh);
  return options.limit ? sorted.slice(0, options.limit) : sorted;
}
