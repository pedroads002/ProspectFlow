import type { LeadEvent, LeadEventType } from "@/generated/prisma/client";

export type { LeadEvent, LeadEventType };

/**
 * The one-click UI actions from PRD §1.2 — each maps to a status transition
 * (or no change) plus a LeadEvent, defined in status.service.ts.
 */
export type QuickAction =
  | "NO_REPLY"
  | "REPLIED"
  | "INTERESTED"
  | "FOLLOW_UP"
  | "MEETING_SCHEDULED"
  | "SALE_COMPLETED"
  | "LOST";
