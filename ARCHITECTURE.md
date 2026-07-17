# ProspectFlow — Architecture

> Implements the requirements in [PRD.md](./PRD.md) under the constraints and philosophy in
> [VISION.md](./VISION.md). Rationale for each decision below is expanded in
> [DECISIONS.md](./DECISIONS.md). Entity-level detail is in [DATA_MODEL.md](./DATA_MODEL.md).

## 1. High-Level Architecture

ProspectFlow is a **modular monolith**: a single Next.js application, a single deployment unit, a
single Postgres database — internally organized into clearly bounded modules so it *reads* and
*evolves* like a set of services, without paying the operational cost of actually running
distributed services.

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Application                    │
│  (Vercel — Server Components, Server Actions, Route Handlers)│
│                                                               │
│  ┌───────────┐ ┌────────────┐ ┌──────────┐ ┌──────────────┐ │
│  │  Tenancy  │ │Prospecting │ │ Outreach │ │  Proposals   │ │
│  │  Module   │ │  Module    │ │  Module  │ │   Module     │ │
│  └─────┬─────┘ └─────┬──────┘ └────┬─────┘ └──────┬───────┘ │
│        │             │             │              │         │
│        └─────────────┴──────┬──────┴──────────────┘         │
│                              │                               │
│                       ┌──────▼───────┐                       │
│                       │   AI Module   │                      │
│                       │ (provider-    │                      │
│                       │  agnostic)    │                      │
│                       └──────┬───────┘                       │
└──────────────────────────────┼───────────────────────────────┘
                               │
        ┌──────────────────────┼───────────────────────┐
        │                      │                       │
 ┌──────▼───────┐      ┌───────▼────────┐     ┌─────────▼────────┐
 │   Supabase    │      │  AI Providers  │     │   Vercel infra   │
 │ Postgres+Auth │      │ (Anthropic/    │     │ (hosting, envs,  │
 │               │      │  OpenAI/Google)│     │  edge/serverless)│
 └───────────────┘      └────────────────┘     └───────────────────┘
```

This single-app shape is deliberate: it is the architecture a solo developer, assisted by AI
tooling, can hold in their head and change safely. See [DECISIONS.md](./DECISIONS.md#why-modular-monolith).

## 2. Module Responsibilities

| Module | Owns | Does not own |
|---|---|---|
| **Tenancy** | Tenants, Users, membership, session/auth integration, tenant-scoped access enforcement | Business logic of any other module |
| **Prospecting** | Lead entity, Lead CRUD, `LeadSourceProvider` abstraction and its implementations | How messages are drafted or sent |
| **Outreach** | Message drafts, send confirmation, conversation log entries, Quick Actions, Status transitions, Momentum computation | Lead identity/sourcing, AI provider details |
| **AI** | Provider-agnostic AI interface, task-to-model routing, prompt construction, response shaping (brevity, structure) | Persisting business data — it is called by other modules, it doesn't own Leads/Conversations itself |
| **Proposals** | Proposal draft generation and lifecycle (draft → sent confirmation) | Formatting/document generation (out of MVP scope) |

Modules communicate through explicit TypeScript interfaces/service calls within the same process
— never through HTTP calls to "themselves." This is the core discipline that keeps a modular
monolith from decaying into a tangled one: a module's internals are private; only its service
interface is public to other modules.

## 3. Modular Monolith Design

Enforced boundaries:
- Each module exposes a small `service` surface (e.g. `LeadService`, `MomentumService`,
  `AIService`) — other modules import *only* these, never a module's internal repository or
  database types directly.
- Cross-module data flows through typed DTOs, not shared mutable state.
- The `AI` module is the only module allowed to talk to external AI providers. No other module
  imports an AI SDK directly — this is what makes "swap providers without touching business
  logic" actually true rather than aspirational.
- The `Tenancy` module's scoping helper is used by every other module's data-access calls; no
  module is allowed to query the database without passing through it.

This gives a credible extraction path later: if, say, `Prospecting` needs to become a separate
scraping service under real load, its service-interface boundary means the extraction touches one
module's internals, not the whole app.

## 4. AI Architecture

### 4.1 Provider-agnostic interface

All AI usage goes through one interface (conceptually):

```
AIProvider {
  draftFirstContactMessage(context) → DraftResult
  draftFollowUpMessage(context) → DraftResult
  summarizeConversation(context) → SummaryResult
  analyzeSentiment(context) → SentimentResult
  suggestNextAction(context) → NextActionResult
  draftProposal(context) → ProposalDraftResult
}
```

Concrete implementations wrap the **Vercel AI SDK**, which already normalizes access to Anthropic,
OpenAI, and Google models behind one calling convention — this is what makes the abstraction cheap
to build rather than a bespoke integration layer per provider.

### 4.2 Task-based model routing

A single routing configuration maps *task type* → *provider + model*, not the whole app to one
model:

| Task | Priority | MVP default |
|---|---|---|
| First-contact / follow-up drafting | Quality + human-likeness | Claude (higher-capability model) |
| Conversation summary | Quality, brevity | Claude (higher-capability model) |
| Sentiment / objection classification | Speed + cost | Faster/cheaper model |
| Proposal drafting | Quality | Claude (higher-capability model) |

Changing this mapping — or adding a new provider — is a change in one configuration/module, never
a change scattered across the app. This directly satisfies the "not tightly coupled to one
provider" requirement from discovery.

### 4.3 Response shaping

The AI module is responsible for enforcing the product's brevity requirement (PRD §3): prompts
instruct for concise, structured, actionable output, and the module post-processes/validates
length before handing results to the UI. This is treated as an architectural responsibility, not
left to prompt wording alone.

### 4.4 Failure isolation

Per NFR in PRD §3, AI failures must never block the core workflow. The AI module surfaces errors
as a distinct UI state ("AI assistance unavailable — try again") while Lead management, manual
message logging, and status updates keep working independently of AI provider uptime.

### 4.5 Sales-Playbook Knowledge Assembly

Beyond Commercial Profile, Lead, and conversation history, prompt construction draws on a fourth
input: the user's own sales methodology (how to open a conversation, diagnose, handle objections,
transition, pitch, invite to a meeting, follow up). This lives as plain Markdown in
`src/modules/ai/knowledge/` (`core-rules.md`, `playbook.md`) — version-controlled like the rest of
the codebase, not a database entity (see [DECISIONS.md](./DECISIONS.md#why-the-sales-playbook-is-file-based-not-a-database-entity)
for why).

`knowledge/knowledge.service.ts` is the one seam that reads these files and assembles, per AI task,
only the fragments relevant to it — never the whole playbook in one prompt:
- `core-rules.md` is short by convention and always included in full.
- `playbook.md` is divided into fixed sections (`## Abertura`, `## Diagnóstico`, `## Quebra de
  Objeções`, `## Transição`, `## Pitch`, `## Convite para Reunião`, `## Follow-up`); each
  `prompts/*.ts` builder pulls only the stages relevant to its task (and, for conversation
  analysis, further narrowed by the Lead's current status) — the same rule-based, explainable
  selection philosophy already used for Momentum (§4.2's task routing is orthogonal to this: which
  *model* answers a task is independent of which *knowledge* feeds it).

This keeps the module boundary intact: `prompts/*.ts` remains the only place that shapes final
prompt text (§2), it just now has a fourth, file-backed input alongside Commercial Profile/Lead/
history. The product guardrails that are non-negotiable regardless of playbook content (never sound
like a marketing agency, never send automatically — PRD FR-2.3, CLAUDE.md) stay hardcoded in the
prompt builders themselves, not in the playbook files.

## 5. Multi-Tenant Strategy

**Model: shared database, shared schema, `tenant_id` column on every tenant-scoped table.**

Chosen over schema-per-tenant or database-per-tenant because it is the cheapest to operate, the
simplest to migrate, and fully sufficient at the scale ProspectFlow expects for years (see
[DECISIONS.md](./DECISIONS.md#why-multi-tenant-from-day-one)).

Enforcement happens at two layers, deliberately redundant:
1. **Application layer:** every repository/query helper in the Tenancy module requires an explicit
   tenant context and injects `tenant_id` into every query. No module is permitted to construct a
   raw Prisma query against a tenant-scoped table without going through this helper.
2. **Database layer:** Postgres Row-Level Security (RLS) policies on every tenant-scoped table,
   keyed off the authenticated user's tenant via Supabase's JWT claims. This is defense-in-depth —
   even a bug in application-layer scoping cannot leak cross-tenant rows.

The MVP runs with a single active tenant, but both layers are live from the first migration —
there is no "add tenancy later" step.

## 6. Authentication

**Supabase Auth**, chosen over a third-party auth provider (e.g. Clerk) to keep the number of
external services minimal — Supabase already hosts the database, so pairing it with the same
platform's auth avoids a second vendor, a second webhook surface, and a second place session state
can drift from tenant state. Full comparison in
[DECISIONS.md](./DECISIONS.md#why-supabase-instead-of-clerk).

- Supabase Auth handles credentials, session issuance, and JWTs.
- A `User` row is created in ProspectFlow's schema on first sign-in, linked to a `Tenant` (the
  first user of a tenant becomes its `Owner`; multi-user-per-tenant roles are future scope).
- JWT claims carry the tenant identifier consumed by RLS policies (§5).
- Next.js middleware validates the session on protected routes; Server Components/Actions read the
  authenticated user + tenant context from a single shared helper, never re-implemented per route.

## 7. Database Strategy

- **PostgreSQL**, hosted on Supabase.
- **Prisma ORM** as the sole data-access layer — chosen for type safety and low ceremony, valuable
  for a solo developer working with AI-assisted coding (see
  [DECISIONS.md](./DECISIONS.md#why-prisma)).
- Migrations are Prisma-managed and checked into version control; there is no manual schema
  drift — see [CLAUDE.md](./CLAUDE.md) for the migration workflow.
- Every tenant-scoped table carries `tenantId`, and every table carries audit fields
  (`createdAt`, `updatedAt`) — full field-level detail in [DATA_MODEL.md](./DATA_MODEL.md).
- Soft-delete is used only as an accidental-deletion safety net at the infrastructure level, not
  as a user-facing feature (PRD §7.6) — a Lead marked deleted is excluded from every application
  query and purged after a short retention window.

## 8. API Architecture

ProspectFlow does **not** expose a general-purpose public REST/GraphQL API in the MVP. Since the
frontend and backend are the same Next.js application, most operations are implemented as:
- **Server Components** for read paths (data fetched directly via Prisma on the server, no
  client-side fetch round-trip needed).
- **Server Actions** for writes (Lead CRUD, Quick Actions, message-sent confirmation, AI assistance
  requests) — typed, colocated with the UI that calls them, no hand-maintained REST contract.
- **Route Handlers** (`/app/api/...`) reserved for cases that need a true HTTP endpoint (e.g. a
  future webhook from an AI provider, or a future public integration) — not used for internal
  app traffic in the MVP.

This is intentionally the simplest viable option: no API versioning, no separate API client
package, nothing to keep in sync between "frontend" and "backend" because there isn't a hard
seam between them yet. A public API becomes real scope only if/when ProspectFlow needs external
integrations (e.g. Zapier, a mobile app) — at that point Route Handlers are the designated
extension point, not a rewrite.

## 9. Folder Structure

```
prospectflow/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/                          # Next.js App Router (routes only — thin)
│   │   ├── (dashboard)/
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx          # Lead list
│   │   │   │   └── [id]/page.tsx     # Lead detail
│   │   │   └── settings/page.tsx     # Commercial profile / tone config
│   │   ├── (auth)/
│   │   │   ├── sign-in/page.tsx
│   │   │   └── sign-up/page.tsx
│   │   └── api/                      # Route Handlers (reserved, minimal in MVP)
│   ├── modules/
│   │   ├── tenancy/
│   │   │   ├── auth.ts               # Session/user/tenant resolution helpers
│   │   │   ├── scoped-client.ts      # Tenant-scoped Prisma access helper
│   │   │   └── types.ts
│   │   ├── prospecting/
│   │   │   ├── lead.service.ts
│   │   │   ├── lead.repository.ts
│   │   │   ├── lead-source/
│   │   │   │   ├── provider.interface.ts
│   │   │   │   └── providers/
│   │   │   │       └── manual-entry.provider.ts
│   │   │   └── types.ts
│   │   ├── outreach/
│   │   │   ├── message.service.ts
│   │   │   ├── status.service.ts     # Status transition rules (PRD §7)
│   │   │   ├── momentum.service.ts   # Momentum computation (PRD §1.4)
│   │   │   └── types.ts
│   │   ├── ai/
│   │   │   ├── provider.interface.ts
│   │   │   ├── router.ts             # Task → provider/model config
│   │   │   ├── providers/
│   │   │   │   ├── anthropic.provider.ts
│   │   │   │   ├── openai.provider.ts
│   │   │   │   └── google.provider.ts
│   │   │   ├── prompts/
│   │   │   └── types.ts
│   │   └── proposals/
│   │       ├── proposal.service.ts
│   │       └── types.ts
│   ├── components/                   # Shared, desktop-first UI components
│   ├── lib/                          # Cross-cutting: env config, db client, logging
│   └── styles/
├── CLAUDE.md
├── VISION.md
├── PRD.md
├── ARCHITECTURE.md
├── DATA_MODEL.md
├── MVP_BACKLOG.md
├── DECISIONS.md
└── README.md
```

Rule of thumb enforced by this structure: **`app/` renders and routes; `modules/` decides.** UI
components should rarely contain business logic beyond presentation and calling a module's service.

## 10. Security Considerations

- Tenant isolation enforced redundantly at application and database layers (§5).
- Only public business data fields exist in the schema (PRD §1.3, §3) — there is no field designed
  to hold sensitive personal data, which limits exposure by construction rather than by policy.
- Secrets (DB connection strings, AI provider keys, Supabase keys) live only in Vercel/Supabase
  environment configuration, never in source control.
- Pasted conversation text is treated as untrusted input before being included in AI prompts —
  basic sanitization/size limits are applied to reduce prompt-injection and cost-abuse risk.
- AI endpoints are rate-limited per tenant to bound cost exposure from any single account.
- Full Lead deletion (PRD FR-8) is implemented so no orphaned conversation/message data survives
  deletion, keeping data-minimization real rather than nominal.

## 11. Scalability Strategy

- The Next.js app deploys as serverless/edge functions on Vercel, which scale horizontally by
  request without capacity planning — appropriate given usage will grow gradually from one tenant.
- Supabase Postgres uses connection pooling (PgBouncer, built into Supabase) so serverless
  concurrency doesn't exhaust database connections as tenant count grows.
- `tenantId` is indexed on every tenant-scoped table from the first migration, keeping query
  performance stable as row counts grow per tenant, not just in aggregate.
- Heavier future workloads (scraping-based `LeadSourceProvider`s, bulk AI batch jobs, automated
  sending schedules) are explicitly designed to live in a background job runner (e.g. Inngest or
  Trigger.dev) added later — the monolith itself stays stateless and is never blocked by long-
  running work. This is a planned extension point, not a retrofit.

## 12. Deployment Architecture

- **Vercel** hosts the Next.js application: preview deployments per branch/PR, production
  deployment from `main`.
- **Supabase** hosts Postgres + Auth (and, later, Storage if needed) as a single managed project
  for the MVP; environment separation (dev/staging/prod) is achieved via Vercel environment
  variables pointing at project-appropriate Supabase credentials, with a clear seam to split into
  separate Supabase projects per environment once budget/usage justifies it.
- No containers, no Kubernetes, no self-managed servers — deliberately, per the cost and
  maintainability constraints in VISION.md.

## 13. Future Extensibility

Designed extension points (not built yet, but the architecture does not block them):
- **New `LeadSourceProvider` implementations** (Instagram, Google Maps, public directories, future
  APIs) plug into the existing interface in `modules/prospecting/lead-source/providers/`.
- **New AI providers** plug into `modules/ai/providers/` and are wired in via `router.ts` without
  touching any calling module.
- **Semi-automated/automated sending** becomes a new capability inside `outreach`, layered behind
  the existing manual-send flow (manual remains available, never removed).
- **Background jobs** (scheduled follow-ups, scraping runs, bulk AI operations) are added as a
  separate worker process/service once needed, communicating with the same Postgres database —
  the modular boundaries mean this doesn't require redesigning existing modules.
- **Multi-user tenants and roles** extend the Tenancy module's membership model without changing
  how Prospecting/Outreach/AI/Proposals scope their data (they already scope by `tenantId`, not by
  user).
