import type { LeadStatus, Momentum, Role } from "@/generated/prisma/enums";

/**
 * Portuguese (Brazil) display labels for domain enums (UI-only — the enum
 * values themselves stay in English in the database/code per DATA_MODEL.md).
 */
export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Novo",
  CONTACTED: "Contatado",
  REPLIED: "Respondeu",
  QUALIFIED: "Qualificado",
  PROPOSAL_SENT: "Proposta Enviada",
  NEGOTIATION: "Negociação",
  SALE_COMPLETED: "Venda Concluída",
  LOST: "Perdido",
};

export const MOMENTUM_LABELS: Record<Momentum, string> = {
  RISING: "Em Alta",
  STEADY: "Estável",
  COOLING: "Esfriando",
  STALLED: "Parado",
};

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Proprietário",
  MEMBER: "Membro",
};
