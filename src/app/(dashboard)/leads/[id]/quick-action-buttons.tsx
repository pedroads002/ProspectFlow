"use client";

import { useTransition } from "react";
import { Zap } from "lucide-react";
import { applyQuickActionAction } from "../actions";
import type { QuickAction } from "@/modules/outreach/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const LABELS: Record<QuickAction, string> = {
  NO_REPLY: "Sem Resposta",
  REPLIED: "Respondeu",
  INTERESTED: "Interessado",
  FOLLOW_UP: "Follow-up",
  MEETING_SCHEDULED: "Reunião Agendada",
  SALE_COMPLETED: "Venda Concluída",
  LOST: "Perdido",
};

export function QuickActionButtons({
  leadId,
  actions,
}: {
  leadId: string;
  actions: QuickAction[];
}) {
  const [isPending, startTransition] = useTransition();

  if (actions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="size-4 text-muted-foreground" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action}
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() =>
              startTransition(() => {
                applyQuickActionAction(leadId, action);
              })
            }
          >
            {LABELS[action]}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
