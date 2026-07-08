import type { TimelineItem } from "@/modules/outreach/timeline.service";
import type { LeadEventType } from "@/generated/prisma/enums";

const EVENT_LABELS: Record<LeadEventType, string> = {
  STATUS_CHANGED: "Status changed",
  NO_REPLY_LOGGED: "No reply",
  FOLLOW_UP_LOGGED: "Follow-up logged",
  MESSAGE_SENT: "Message sent",
  CONVERSATION_PASTED: "Conversation pasted",
  AI_ASSISTANCE_REQUESTED: "AI assistance requested",
};

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function LeadTimeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-500">No activity yet for this lead.</p>
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
          className="flex flex-col gap-0.5 border-b border-zinc-100 pb-3 text-sm last:border-0 dark:border-zinc-900"
        >
          <span className="text-xs text-zinc-500">
            {formatTimestamp(item.timestamp)}
          </span>

          {item.type === "EVENT" && (
            <span>
              {EVENT_LABELS[item.event.type]}
              {item.event.fromStatus && item.event.toStatus
                ? `: ${item.event.fromStatus} → ${item.event.toStatus}`
                : ""}
            </span>
          )}

          {item.type === "MESSAGE" && (
            <span>
              {item.message.kind === "PROPOSAL"
                ? "Proposal"
                : item.message.kind === "FIRST_CONTACT"
                  ? "First-contact message"
                  : "Follow-up message"}{" "}
              ({item.message.channel.toLowerCase()},{" "}
              {item.message.status === "SENT" ? "sent" : "draft"}) —{" "}
              {truncate(item.message.content || "(empty)", 140)}
            </span>
          )}

          {item.type === "CONVERSATION" && (
            <span>Conversation pasted — {truncate(item.entry.rawText, 140)}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
