# Proposals Module

Owns proposal draft generation and lifecycle (draft → sent confirmation), operating on
`OutboundMessage` records with `kind = PROPOSAL`. See
[ARCHITECTURE.md](../../../ARCHITECTURE.md#2-module-responsibilities) and
[DATA_MODEL.md](../../../DATA_MODEL.md#36-outboundmessage).

Implemented starting in Sprint 3 (see [MVP_BACKLOG.md](../../../MVP_BACKLOG.md)). This placeholder
exists so the module boundary is reserved from Sprint 0 — no logic lives here yet.
