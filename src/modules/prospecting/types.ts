import type { Lead, LeadStatus } from "@/generated/prisma/client";

export type { Lead, LeadStatus };

export type LeadFilters = {
  status?: LeadStatus;
  niche?: string;
  search?: string;
};
