# CLAUDE.md — Working Conventions for ProspectFlow

This file tells Claude Code (and any future contributor) how to work in this repository. Read it
before making changes. Its purpose is to keep future prompts short: these conventions apply by
default and don't need to be repeated per task.

Source-of-truth documents, read in this order when context is needed:
[VISION.md](./VISION.md) → [PRD.md](./PRD.md) → [ARCHITECTURE.md](./ARCHITECTURE.md) →
[DATA_MODEL.md](./DATA_MODEL.md) → [MVP_BACKLOG.md](./MVP_BACKLOG.md) → [DECISIONS.md](./DECISIONS.md).

## Non-Negotiable Product Rules

These come from VISION.md/PRD.md and constrain every implementation decision:
- ProspectFlow is not a CRM. Don't add deal-pipeline, invoicing, calendar, or task-management
  features "while you're in there."
- No message is ever sent to a prospect automatically. Every send is a manual, explicit user
  action. Never implement a code path that transmits a message to a prospect without it.
- AI drafts are suggestions, never final. "Generate a draft" and "mark as sent" are always
  separate actions.
- AI output must be concise and actionable by default — when writing prompts or shaping AI
  responses, optimize for brevity, not completeness.
- Every tenant-scoped query must be tenant-scoped. There is no "trusted internal" code path that
  skips it.

## Architecture Rules

- This is a **modular monolith** (ARCHITECTURE.md §1–3). Code lives in `src/modules/<domain>/`.
  A module's internals (repository, raw types) are private to that module — other modules import
  only its `*.service.ts` surface.
- The `ai` module is the only place allowed to import an AI SDK. If you find yourself importing
  the Vercel AI SDK or a provider SDK outside `src/modules/ai/`, stop — route it through
  `AIService` instead.
- The `tenancy` module's scoped-access helper is mandatory for any database read/write touching a
  tenant-scoped table. Do not call Prisma directly from a route/component/action — go through a
  module's service, which goes through the scoped helper.
- `src/app/` is thin: routing, layout, and calling module services from Server Components/Actions.
  Business logic belongs in `src/modules/`, not in `app/`.
- Before adding a new abstraction (interface, provider, config layer), check ARCHITECTURE.md §13
  (Future Extensibility) — if it's an already-planned extension point, follow the documented shape
  instead of inventing a new one.

## Code Style & Naming

- TypeScript everywhere, strict mode on. No `any` unless justified with a comment explaining why
  a type can't be expressed.
- Files: `kebab-case.ts`. Types/interfaces/classes: `PascalCase`. Variables/functions:
  `camelCase`. Enum values: `UPPER_SNAKE_CASE` (matches DATA_MODEL.md enums exactly — don't
  reformat them).
- Service files: `*.service.ts`. Repository/data-access files: `*.repository.ts`. Shared types:
  `types.ts` per module.
- Match entity and field names to DATA_MODEL.md exactly (`Lead`, `LeadEvent`, `OutboundMessage`,
  `momentum`, `lastActivityAt`, etc.). If a name needs to change, update DATA_MODEL.md in the same
  change, not after.
- No commented-out code, no speculative TODOs for hypothetical futures. If it's real future work,
  it belongs in MVP_BACKLOG.md, not a code comment.

## Folder & Component Organization

Follow ARCHITECTURE.md §9 exactly. When adding a new domain concept, ask "which existing module
owns this?" before creating a new one — most things belong inside `prospecting`, `outreach`,
`ai`, `proposals`, or `tenancy`. Only propose a new module if the concept genuinely doesn't fit any
existing module's responsibility (ARCHITECTURE.md §2).

UI components:
- `src/components/` holds shared, presentation-only components. If a component contains business
  logic (status transition rules, momentum math), that logic belongs in the owning module's
  service, called from the component — not embedded in JSX.
- Desktop-first (ARCHITECTURE.md, PRD NFR "Usability"): design and test at desktop widths first;
  responsive down to tablet is required, mobile-perfect is not.

## AI Prompts

- Prompt construction lives in `src/modules/ai/prompts/`, one file per task type
  (`draft-first-contact.ts`, `summarize-conversation.ts`, etc.) — never inline prompt strings in a
  service or component.
- Every prompt for a prospect-facing draft must explicitly instruct against sales-pitch/marketing-
  agency phrasing (PRD FR-2.3) and must incorporate: Lead public info, Commercial Profile, tone
  description, and prior conversation history when present.
- Every prompt for an assistance/analysis task (summary, sentiment, next action) must explicitly
  instruct for brevity — a few sentences or a short list, never a long-form response.
- When adding or changing a provider, implement it in `src/modules/ai/providers/` against the
  existing `AIProvider` interface (ARCHITECTURE.md §4.1) and register it only in
  `src/modules/ai/router.ts`. Don't scatter provider selection logic elsewhere.

## Database Migrations

- All schema changes go through Prisma migrations (`prisma migrate dev` locally), committed to
  `prisma/migrations/`. No manual schema edits against the Supabase database.
- Before writing a migration, check DATA_MODEL.md — the migration should match it. If the
  migration needs to diverge (a field type, an index, a constraint), update DATA_MODEL.md in the
  same commit, with a one-line note on why.
- Any new tenant-scoped table must include `tenantId` and a corresponding RLS policy
  (ARCHITECTURE.md §5) — this is not optional per-table.
- Prefer additive migrations (new nullable column, new table) over destructive ones. Flag any
  destructive migration (dropped column, changed type) explicitly before running it.

## Git Workflow

- `main` is always deployable (Vercel deploys it to production).
- Work in short-lived feature branches per sprint deliverable (see MVP_BACKLOG.md), not one branch
  per sprint — smaller, reviewable units.
- Rebase/update from `main` before opening a PR; don't let branches drift for multiple sprints.

## Commit Conventions

Conventional Commits, scoped to the module when it aids clarity:
- `feat(prospecting): add lead deletion flow`
- `fix(outreach): correct momentum decay for negotiation stage`
- `docs: update DATA_MODEL for AIInteraction indexes`
- `chore(db): add migration for LeadEvent table`

Commit messages describe *why* when the *why* isn't obvious from the diff (matches this project's
general engineering standard) — e.g. "why this business rule," not "what lines changed."

## Documentation Updates

Documentation is source of truth, not an afterthought:
- A change to entities/fields/relationships → update DATA_MODEL.md in the same change.
- A change to a module boundary, the AI routing strategy, or the multi-tenant approach → update
  ARCHITECTURE.md in the same change.
- A change to scope (a feature added, cut, or deferred) → update PRD.md §6/§8/§9 and
  MVP_BACKLOG.md in the same change.
- A new significant technical or product decision → add an entry to DECISIONS.md following its
  existing format (Decision / Why / Alternatives / Trade-offs / Future implications).
- Do not let code and docs diverge silently — if you notice an existing doc is already wrong,
  fix it as part of the current change rather than leaving it.

## Testing Strategy

Pragmatic, not exhaustive — matched to a solo-developer-maintained MVP:
- **Business logic that isn't obvious from reading it** gets unit tests first: status transition
  rules (PRD §7.1), Momentum computation (PRD §1.4), tenant-scoping helpers.
- **AI-calling code** is tested by mocking the `AIProvider` interface — never hit a real AI
  provider in automated tests.
- **UI/end-to-end** testing is manual for the MVP (per the `/verify` workflow: drive the actual
  flow in the running app), not a Cypress/Playwright suite — revisit this once there's enough
  surface area that manual verification becomes the bottleneck.
- Every Definition of Done in MVP_BACKLOG.md includes manual verification against a real Lead, not
  just passing automated tests — automated tests confirm correctness, they don't confirm the
  feature is actually useful.
