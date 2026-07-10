# ProspectFlow — Data Model

> Entity-level design supporting [PRD.md](./PRD.md) and [ARCHITECTURE.md](./ARCHITECTURE.md).
> This is a **schema design**, not an implementation — the actual `prisma/schema.prisma` is
> written during implementation and may adjust naming/types, but should not deviate from the
> entities, relationships, and constraints below without updating this document first.

## 1. Entity Overview

| Entity | Purpose |
|---|---|
| `Tenant` | An account/organization using ProspectFlow. The unit of data isolation. |
| `User` | A person who signs in, belonging to exactly one Tenant. |
| `CommercialProfile` | The tenant's value proposition, services, and communication tone — the personalization input for all AI drafting. |
| `Lead` | A prospect being tracked through the outbound lifecycle. |
| `LeadEvent` | An immutable timeline entry for a Lead (status change, quick action, message sent, etc.) — the source of truth Momentum is computed from. |
| `OutboundMessage` | A drafted or sent message tied to a Lead (first-contact, follow-up, or proposal). |
| `ConversationEntry` | Raw conversation text pasted by the user for AI assistance. |
| `AIInteraction` | A record of one AI assistance call: task type, provider/model used, and output — for auditability and future cost tracking. |

## 2. Entity-Relationship Summary

```
Tenant 1───N User
Tenant 1───1 CommercialProfile
Tenant 1───N Lead
Lead   1───N LeadEvent
Lead   1───N OutboundMessage
Lead   1───N ConversationEntry
Lead   1───N AIInteraction
```

All child entities of `Lead` also carry a denormalized `tenantId` (see §5, Multi-Tenant
Considerations) — so the relationship diagram above is the conceptual model; the physical model
scopes every table directly to `Tenant`, not only transitively through `Lead`.

## 3. Entities

### 3.1 `Tenant`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | uuid (PK) | yes | |
| `name` | text | yes | Display name of the account |
| `createdAt` | timestamp | yes | Audit field |
| `updatedAt` | timestamp | yes | Audit field |

Constraints: none beyond `name` being non-empty (application-level validation).

### 3.2 `User`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | uuid (PK) | yes | |
| `tenantId` | uuid (FK → Tenant) | yes | |
| `supabaseUserId` | text | yes | Unique. Links to Supabase Auth's user id. |
| `email` | text | yes | Unique |
| `name` | text | no | Display name shown throughout the UI (greeting, avatar initials, sidebar, profile) — captured at sign-up (passed through Supabase Auth's `user_metadata.full_name`) and editable later from Settings. Nullable to accommodate accounts created before this field existed; the UI falls back to a generic, non-identifying placeholder when absent — it never displays `email` or a parsed identifier as if it were the name. Deliberately separate from `Tenant.name`, which represents the workspace/account, not the individual person. |
| `role` | enum: `OWNER`, `MEMBER` | yes | MVP only ever creates `OWNER`; `MEMBER` reserved for future multi-user tenants |
| `createdAt` / `updatedAt` | timestamp | yes | |

Indexes: `tenantId`; unique on `supabaseUserId` and `email`.

### 3.3 `CommercialProfile`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | uuid (PK) | yes | |
| `tenantId` | uuid (FK → Tenant, unique) | yes | 1:1 with Tenant |
| `valueProposition` | text | yes | What the user sells / area of expertise |
| `toneDescription` | text | yes | Communication style guidance used in every AI prompt |
| `servicesOffered` | text | no | Optional extra detail for personalization |
| `createdAt` / `updatedAt` | timestamp | yes | |

Design note: modeled 1:1 with `Tenant` rather than per-`User`, because the MVP tenant is a single
consultant. When multi-user tenants (agencies) arrive, this may need to move to per-`User` (each
consultant has their own voice) — flagged here explicitly so it isn't a silent migration surprise
later.

### 3.4 `Lead`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | uuid (PK) | yes | |
| `tenantId` | uuid (FK → Tenant) | yes | |
| `name` | text | yes | Business or professional name |
| `instagram` | text | no | Public handle, stored normalized (no `@`, no full URL) regardless of how the user typed it |
| `followerCount` | integer | no | Manually entered Instagram follower count — a qualification signal in the Instagram-DM prospecting flow (WORKFLOW.md), and future input for AI-assisted lead analysis |
| `whatsapp` | text | no | Public number |
| `niche` | text | yes | e.g. "Dental Clinic" (free text in MVP). Labeled "Especialidade" in the UI — display label only, same field/values |
| `notes` | text | no | Freeform |
| `status` | enum `LeadStatus` | yes | Default `NEW`. See PRD §1.1 for values. |
| `momentum` | enum `Momentum` | yes | Default `STEADY`. Cached/derived — recalculated on read and on every write to `lastActivityAt`. |
| `sourceType` | enum `LeadSourceType`: `MANUAL`, `INSTAGRAM`, `GOOGLE_MAPS`, `DIRECTORY`, `API` | yes | Default `MANUAL`. MVP only produces `MANUAL`; other values reserved for future `LeadSourceProvider`s. |
| `lastActivityAt` | timestamp | yes | Default now; updated by every `LeadEvent`. Drives Momentum. |
| `deletedAt` | timestamp | no | Soft-delete safety net only (see §6) — never read by application queries in normal operation. |
| `createdAt` / `updatedAt` | timestamp | yes | |

Indexes: `tenantId`; composite `(tenantId, status)`; composite `(tenantId, momentum)`; `lastActivityAt` — these support the Lead list's primary filter/sort needs (PRD §1.4, FR-1.4).

Application-level validation (not a DB constraint, to keep the schema forgiving of future sources
that might not have either): at least one of `instagram` or `whatsapp` must be present. Enforced by
`leadFieldsSchema` at creation and edit time (not deferred until first-contact drafting), so the
gap is caught at data-entry, the actual system boundary for this data (CLAUDE.md).

### 3.5 `LeadEvent`

The append-only timeline that both status transitions and quick actions write to. This is the
audit trail Momentum is computed from (PRD §1.4) and the record that makes a Lead's history
reconstructable.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | uuid (PK) | yes | |
| `leadId` | uuid (FK → Lead) | yes | |
| `tenantId` | uuid (FK → Tenant) | yes | Denormalized — see §5 |
| `type` | enum `LeadEventType`: `STATUS_CHANGED`, `NO_REPLY_LOGGED`, `FOLLOW_UP_LOGGED`, `MESSAGE_SENT`, `CONVERSATION_PASTED`, `AI_ASSISTANCE_REQUESTED` | yes | |
| `fromStatus` | enum `LeadStatus` | no | Set only when `type = STATUS_CHANGED` |
| `toStatus` | enum `LeadStatus` | no | Set only when `type = STATUS_CHANGED` |
| `createdAt` | timestamp | yes | |

Indexes: composite `(leadId, createdAt)` for timeline reads; `tenantId` for RLS/scoping.

This table is never updated or deleted (append-only) — it is the ground truth for both the Lead
timeline UI and the Momentum calculation, so its integrity must not depend on any other table's
mutability.

### 3.6 `OutboundMessage`

Represents any message drafted for a Lead — first-contact, follow-up, or proposal — from AI draft
through manual send confirmation.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | uuid (PK) | yes | |
| `leadId` | uuid (FK → Lead) | yes | |
| `tenantId` | uuid (FK → Tenant) | yes | Denormalized |
| `kind` | enum `MessageKind`: `FIRST_CONTACT`, `FOLLOW_UP`, `PROPOSAL` | yes | |
| `channel` | enum `Channel`: `WHATSAPP`, `INSTAGRAM` | yes | Metadata only in MVP — no channel integration |
| `content` | text | yes | Current draft/final text (user-editable) |
| `aiGenerated` | boolean | yes | Default `true`; `false` if user wrote it from scratch |
| `status` | enum `MessageStatus`: `DRAFT`, `SENT` | yes | Default `DRAFT` |
| `sentAt` | timestamp | no | Required (application-enforced) when `status = SENT` |
| `createdAt` / `updatedAt` | timestamp | yes | |

Indexes: composite `(leadId, kind)`; composite `(tenantId, status)`.

Design note: `Proposal` (PRD FR-5) is **not** a separate table — it is `OutboundMessage` with
`kind = PROPOSAL`. The Proposals module (ARCHITECTURE.md §2) applies proposal-specific business
logic on top of the same underlying entity rather than duplicating the draft/edit/send lifecycle.

### 3.7 `ConversationEntry`

Raw conversation text the user pastes in for AI assistance (PRD FR-4.5).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | uuid (PK) | yes | |
| `leadId` | uuid (FK → Lead) | yes | |
| `tenantId` | uuid (FK → Tenant) | yes | Denormalized |
| `rawText` | text | yes | |
| `pastedAt` | timestamp | yes | Default now |
| `createdAt` | timestamp | yes | |

Indexes: composite `(leadId, pastedAt)`.

This is intentionally a simple append-only log, not a structured "message-by-message" chat model —
the product treats a pasted block as a single unit of context, matching how the user actually
interacts with it (copy/paste from WhatsApp/Instagram).

### 3.8 `AIInteraction`

A record of one AI call — what was asked, which model answered, and what came back. Exists for
auditability (users should be able to see what the AI based a suggestion on) and to support future
cost/usage tracking per tenant.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | uuid (PK) | yes | |
| `leadId` | uuid (FK → Lead) | yes | |
| `tenantId` | uuid (FK → Tenant) | yes | Denormalized |
| `taskType` | enum `AITaskType`: `DRAFT_FIRST_CONTACT`, `DRAFT_FOLLOW_UP`, `SUMMARIZE`, `SENTIMENT`, `NEXT_ACTION`, `PROPOSAL_DRAFT` | yes | |
| `provider` | text | yes | e.g. `"anthropic"` |
| `model` | text | yes | e.g. `"claude-sonnet-..."` |
| `inputSnapshot` | text (or jsonb) | yes | Reference to what was fed to the model (Lead fields used, conversation entry id, profile version) — for explainability, not full raw-prompt storage |
| `outputContent` | text | yes | |
| `createdAt` | timestamp | yes | |

Indexes: composite `(leadId, taskType, createdAt)`.

## 4. Enums Reference

| Enum | Values |
|---|---|
| `LeadStatus` | `NEW`, `CONTACTED`, `REPLIED`, `QUALIFIED`, `PROPOSAL_SENT`, `NEGOTIATION`, `SALE_COMPLETED`, `LOST` |
| `Momentum` | `RISING`, `STEADY`, `COOLING`, `STALLED` |
| `LeadSourceType` | `MANUAL`, `INSTAGRAM`, `GOOGLE_MAPS`, `DIRECTORY`, `API` |
| `LeadEventType` | `STATUS_CHANGED`, `NO_REPLY_LOGGED`, `FOLLOW_UP_LOGGED`, `MESSAGE_SENT`, `CONVERSATION_PASTED`, `AI_ASSISTANCE_REQUESTED` |
| `MessageKind` | `FIRST_CONTACT`, `FOLLOW_UP`, `PROPOSAL` |
| `Channel` | `WHATSAPP`, `INSTAGRAM` |
| `MessageStatus` | `DRAFT`, `SENT` |
| `AITaskType` | `DRAFT_FIRST_CONTACT`, `DRAFT_FOLLOW_UP`, `SUMMARIZE`, `SENTIMENT`, `NEXT_ACTION`, `PROPOSAL_DRAFT` |
| `Role` (User) | `OWNER`, `MEMBER` |

## 5. Multi-Tenant Considerations

- Every table below `Tenant` carries `tenantId` **directly**, even `LeadEvent`,
  `OutboundMessage`, `ConversationEntry`, and `AIInteraction`, which are conceptually reachable
  via `Lead.tenantId`. This denormalization is deliberate: it lets Postgres Row-Level Security
  policies apply directly to every table without requiring a join to `Lead` at query time, and it
  keeps every index tenant-first, matching real query patterns.
- Every application query on a tenant-scoped table must include `tenantId` — enforced through the
  Tenancy module's scoped-access helper (ARCHITECTURE.md §5), never left to individual call sites
  to remember.
- RLS policies mirror the application-level scoping as defense-in-depth, keyed off the tenant claim
  in the Supabase-issued JWT.

## 6. Audit Fields & Soft-Delete

- `createdAt` / `updatedAt` are present on every entity.
- `Lead.deletedAt` is the **only** soft-delete field in the schema, and it exists purely as an
  infrastructure-level safety net against accidental deletion (PRD §7.6) — it is never read by
  normal application queries (every query implicitly filters `deletedAt IS NULL`), and a background
  purge job removes soft-deleted Leads (and cascades to their `LeadEvent`, `OutboundMessage`,
  `ConversationEntry`, `AIInteraction` rows) after a short retention window (e.g. 7 days).
- All other Lead-child tables use `ON DELETE CASCADE` from `Lead`, so a purge (or, if ever exposed,
  an immediate hard delete) removes all associated data in one operation — this is what makes PRD
  FR-1.3/FR-8.1 ("deleting a Lead removes all associated data") a database guarantee, not just an
  application convention.

## 7. Suggested Prisma Model Sketch (design reference only)

The following illustrates the intended shape for implementation — field names, relations, and
enum values as designed above. This is not the file to copy verbatim into `schema.prisma`; it is
a design reference to implement against.

```prisma
// Design reference — not implementation-ready Prisma syntax in every detail.

enum LeadStatus {
  NEW
  CONTACTED
  REPLIED
  QUALIFIED
  PROPOSAL_SENT
  NEGOTIATION
  SALE_COMPLETED
  LOST
}

enum Momentum {
  RISING
  STEADY
  COOLING
  STALLED
}

enum LeadSourceType {
  MANUAL
  INSTAGRAM
  GOOGLE_MAPS
  DIRECTORY
  API
}

model Tenant {
  id                 String             @id @default(uuid())
  name               String
  users              User[]
  commercialProfile  CommercialProfile?
  leads              Lead[]
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
}

model User {
  id              String   @id @default(uuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  supabaseUserId  String   @unique
  email           String   @unique
  name            String?
  role            Role     @default(OWNER)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([tenantId])
}

model CommercialProfile {
  id                String   @id @default(uuid())
  tenantId          String   @unique
  tenant            Tenant   @relation(fields: [tenantId], references: [id])
  valueProposition  String
  toneDescription   String
  servicesOffered   String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Lead {
  id              String              @id @default(uuid())
  tenantId        String
  tenant          Tenant              @relation(fields: [tenantId], references: [id])
  name            String
  instagram       String?
  followerCount   Int?
  whatsapp        String?
  niche           String
  notes           String?
  status          LeadStatus          @default(NEW)
  momentum        Momentum            @default(STEADY)
  sourceType      LeadSourceType      @default(MANUAL)
  lastActivityAt  DateTime            @default(now())
  deletedAt       DateTime?
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  events          LeadEvent[]
  messages        OutboundMessage[]
  conversations   ConversationEntry[]
  aiInteractions  AIInteraction[]

  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, momentum])
  @@index([lastActivityAt])
}

model LeadEvent {
  id         String        @id @default(uuid())
  leadId     String
  lead       Lead          @relation(fields: [leadId], references: [id], onDelete: Cascade)
  tenantId   String
  type       LeadEventType
  fromStatus LeadStatus?
  toStatus   LeadStatus?
  createdAt  DateTime      @default(now())

  @@index([leadId, createdAt])
  @@index([tenantId])
}

model OutboundMessage {
  id           String        @id @default(uuid())
  leadId       String
  lead         Lead          @relation(fields: [leadId], references: [id], onDelete: Cascade)
  tenantId     String
  kind         MessageKind
  channel      Channel
  content      String
  aiGenerated  Boolean       @default(true)
  status       MessageStatus @default(DRAFT)
  sentAt       DateTime?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([leadId, kind])
  @@index([tenantId, status])
}

model ConversationEntry {
  id        String   @id @default(uuid())
  leadId    String
  lead      Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  tenantId  String
  rawText   String
  pastedAt  DateTime @default(now())
  createdAt DateTime @default(now())

  @@index([leadId, pastedAt])
}

model AIInteraction {
  id             String     @id @default(uuid())
  leadId         String
  lead           Lead       @relation(fields: [leadId], references: [id], onDelete: Cascade)
  tenantId       String
  taskType       AITaskType
  provider       String
  model          String
  inputSnapshot  String
  outputContent  String
  createdAt      DateTime   @default(now())

  @@index([leadId, taskType, createdAt])
}
```
