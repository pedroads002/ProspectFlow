# Outreach Module

Owns message drafts, send confirmation, conversation log entries, Quick Actions, Status
transitions, and Momentum computation. See
[ARCHITECTURE.md](../../../ARCHITECTURE.md#2-module-responsibilities) and
[DATA_MODEL.md](../../../DATA_MODEL.md#35-leadevent).

- `lead-event.repository.ts` — the append-only timeline (tenant-scoped) other functions read from.
- `momentum.service.ts` — pure `computeMomentum` (PRD §1.4) plus refresh helpers that recompute
  and persist it on read/write.
- `status.service.ts` — the Quick Action → status transition table (PRD §1.2/§7.1) and
  `applyQuickAction`, the single path every Quick Action button goes through.
- `message.repository.ts` / `message.service.ts` — `OutboundMessage` drafts and send confirmation
  (added alongside AI drafting).

Writes to the `Lead` table itself still go through `modules/prospecting` (via
`updateLeadState`) — Prospecting keeps sole ownership of the `Lead` table; Outreach owns the
decision of what the new status/momentum should be.
