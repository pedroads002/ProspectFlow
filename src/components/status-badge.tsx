import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/domain-labels";
import type { LeadStatus } from "@/generated/prisma/enums";

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <Badge variant="secondary">{STATUS_LABELS[status]}</Badge>;
}
