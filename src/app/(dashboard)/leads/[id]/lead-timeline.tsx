import type { TimelineItem } from "@/modules/outreach/timeline.service";
import type { LeadEventType } from "@/generated/prisma/enums";
import { STATUS_LABELS } from "@/lib/domain-labels";

const EVENT_LABELS: Record<LeadEventType, string> = {
  STATUS_CHANGED: "Status alterado",
  NO_REPLY_LOGGED: "Sem resposta",
  FOLLOW_UP_LOGGED: "Follow-up registrado",
  MESSAGE_SENT: "Mensagem enviada",
  CONVERSATION_PASTED: "Conversa colada",
  AI_ASSISTANCE_REQUESTED: "Assistência de IA solicitada",
};

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function LeadTimeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma atividade ainda para este lead.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li
          key={`${item.type}-${
            item.type === "EVENT"
              ? item.event.id
              : item.type === "MESSAGE"
                ? item.message.id
                : item.entry.id
          }`}
          className="flex flex-col gap-0.5 border-b pb-3 text-sm last:border-0 last:pb-0"
        >
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(item.timestamp)}
          </span>

          {item.type === "EVENT" && (
            <span>
              {EVENT_LABELS[item.event.type]}
              {item.event.fromStatus && item.event.toStatus
                ? `: ${STATUS_LABELS[item.event.fromStatus]} → ${STATUS_LABELS[item.event.toStatus]}`
                : ""}
            </span>
          )}

          {item.type === "MESSAGE" && (
            <span>
              {item.message.kind === "PROPOSAL"
                ? "Proposta"
                : item.message.kind === "FIRST_CONTACT"
                  ? "Mensagem de primeiro contato"
                  : "Mensagem de follow-up"}{" "}
              ({item.message.channel.toLowerCase()},{" "}
              {item.message.status === "SENT" ? "enviada" : "rascunho"}) —{" "}
              {truncate(item.message.content || "(vazio)", 140)}
            </span>
          )}

          {item.type === "CONVERSATION" && (
            <span>
              Conversa colada — {truncate(item.entry.rawText, 140)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
