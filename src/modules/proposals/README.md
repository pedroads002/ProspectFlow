# Proposals Module

Owns proposal draft generation and lifecycle (draft → sent confirmation), operating on
`OutboundMessage` records with `kind = PROPOSAL`. See
[ARCHITECTURE.md](../../../ARCHITECTURE.md#2-module-responsibilities) and
[DATA_MODEL.md](../../../DATA_MODEL.md#36-outboundmessage).

- `proposal.service.ts` — `draftProposal` gathers the Lead + Commercial Profile + full pasted
  conversation history (via `modules/outreach/conversation.service`), calls the AI module, then
  creates the `OutboundMessage` through Outreach's generic `createDraftMessageRecord` — Proposals
  owns the generation, Outreach still owns the write to the table it's responsible for.
- Editing and "mark as sent" reuse Outreach's existing `updateDraftContent`/`markMessageAsSent` —
  a sent `PROPOSAL` message while the Lead is `QUALIFIED`/`NEGOTIATION` transitions it to
  `PROPOSAL_SENT` (PRD §7.1), the same lifecycle every other message kind already goes through.
