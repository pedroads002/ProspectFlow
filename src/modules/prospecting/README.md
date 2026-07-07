# Prospecting Module

Owns the `Lead` entity, Lead CRUD, and the `LeadSourceProvider` abstraction and its
implementations. See [ARCHITECTURE.md](../../../ARCHITECTURE.md#2-module-responsibilities) and
[DATA_MODEL.md](../../../DATA_MODEL.md#34-lead).

- `lead.service.ts` — public surface; other modules/routes import only from here.
- `lead.repository.ts` — the one seam into the `Lead` table; every function takes a `TenantScope`.
- `lead.schema.ts` — shared Zod validation for the public Lead fields (create + edit).
- `lead-source/` — the `LeadSourceProvider` interface and its implementations. MVP ships only
  `manual-entry.provider.ts` (PRD FR-1.5); future sources (Instagram, Google Maps, directories)
  plug in here without changing anything else in this module.
