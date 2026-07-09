"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import {
  pasteConversationAction,
  analyzeConversationAction,
} from "../actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const NEXT_ACTION_LABELS: Record<string, string> = {
  CONTINUE_CONVERSATION: "Continuar a conversa",
  SCHEDULE_MEETING: "Agendar uma reunião",
  SEND_PROPOSAL: "Enviar uma proposta",
  CLOSE_LOST: "Considerar marcar como perdido",
};

export function ConversationPanel({
  leadId,
  entryCount,
}: {
  leadId: string;
  entryCount: number;
}) {
  const pasteForLead = pasteConversationAction.bind(null, leadId);
  const [pasteState, pasteAction, pastePending] = useActionState(
    pasteForLead,
    undefined,
  );

  const analyzeForLead = analyzeConversationAction.bind(null, leadId);
  const [analysisState, analyzeAction, analyzePending] = useActionState(
    analyzeForLead,
    undefined,
  );

  const result =
    analysisState && "result" in analysisState ? analysisState.result : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-muted-foreground" />
          Assistência de Conversa
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form action={pasteAction} className="flex flex-col gap-3">
          <Textarea
            name="rawText"
            rows={5}
            placeholder="Cole a conversa com este prospecto..."
          />
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pastePending} size="sm">
              {pastePending ? "Salvando..." : "Salvar conversa"}
            </Button>
            <span className="text-xs text-muted-foreground">
              {entryCount === 0
                ? "Nenhuma conversa registrada ainda."
                : `${entryCount} registro${entryCount === 1 ? "" : "s"} de conversa.`}
            </span>
          </div>
          {pasteState?.error && (
            <p className="text-sm text-destructive">{pasteState.error}</p>
          )}
        </form>

        <Separator />

        <form action={analyzeAction} className="flex flex-col gap-3">
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={analyzePending || entryCount === 0}
            className="self-start"
          >
            {analyzePending ? "Analisando..." : "Obter Assistência de IA"}
          </Button>

          {analysisState && "error" in analysisState && (
            <p className="text-sm text-destructive">{analysisState.error}</p>
          )}

          {result && (
            <div className="flex flex-col gap-3 text-sm">
              {result.summary && (
                <div>
                  <p className="font-medium text-muted-foreground">Resumo</p>
                  <p>{result.summary}</p>
                </div>
              )}
              {result.sentiment && (
                <div>
                  <p className="font-medium text-muted-foreground">
                    Sentimento / sinais de compra
                  </p>
                  <p>{result.sentiment}</p>
                </div>
              )}
              {result.objections && result.objections.length > 0 && (
                <div>
                  <p className="font-medium text-muted-foreground">Objeções</p>
                  <ul className="list-inside list-disc">
                    {result.objections.map((objection, index) => (
                      <li key={index}>{objection}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.suggestedNextMessage && (
                <div>
                  <p className="font-medium text-muted-foreground">
                    Sugestão de próxima mensagem
                  </p>
                  <p>{result.suggestedNextMessage}</p>
                </div>
              )}
              {result.suggestedFollowUpStrategy && (
                <div>
                  <p className="font-medium text-muted-foreground">
                    Se o prospecto ficar em silêncio
                  </p>
                  <p>{result.suggestedFollowUpStrategy}</p>
                </div>
              )}
              {result.recommendedNextAction && (
                <div>
                  <p className="font-medium text-muted-foreground">
                    Ação recomendada
                  </p>
                  <p>{NEXT_ACTION_LABELS[result.recommendedNextAction]}</p>
                </div>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
