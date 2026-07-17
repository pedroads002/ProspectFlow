# ProspectFlow — Architectural Decision Log

Each entry: what was decided, why, what else was considered, the trade-off accepted, and what it
implies for the future. New significant decisions should be appended here, not just implemented
silently (see CLAUDE.md, Documentation Updates).

---

## Why Modular Monolith

**Decision:** ProspectFlow ships as a single Next.js application with internal module boundaries
(tenancy, prospecting, outreach, ai, proposals), not as separate services.

**Why:** The product is built and maintained by a solo developer assisted by AI tooling. A
microservices architecture would trade a problem ProspectFlow doesn't have (independent scaling of
distinct components under real load) for problems it can't afford (deployment orchestration,
inter-service networking, distributed debugging) at a stage with a handful of users.

**Alternatives considered:**
- *Microservices from day one* — rejected: operational overhead far exceeds any benefit at this
  scale, and it actively works against solo-developer maintainability.
- *No internal structure (single flat app)* — rejected: without enforced module boundaries, a
  fast-moving solo project tends to accumulate tangled cross-cutting logic that becomes hard to
  reason about even for its own author within months.

**Trade-offs accepted:** Slightly more upfront discipline (defining service interfaces between
modules) than a totally flat app, in exchange for a codebase that stays legible as it grows.

**Future implications:** If a specific module (most likely `prospecting`, once scraping-based lead
sources exist, or `ai`, under heavy volume) needs independent scaling or a different runtime, its
existing service-interface boundary makes extraction a scoped project, not a rewrite.

---

## Why Supabase Instead of Clerk (or a separate auth provider)

**Decision:** Authentication uses Supabase Auth, on the same platform as the Postgres database.

**Why:** Supabase already hosts the database (chosen independently for Postgres + low ops
overhead). Pairing auth on the same platform avoids introducing a second external vendor, a second
webhook/sync surface between "who the user is" and "what tenant they belong to," and a second
billing relationship — directly serving the "minimize infrastructure and operational cost" and
"simplicity over complexity" principles from VISION.md.

**Alternatives considered:**
- *Clerk* — excellent multi-tenant/org primitives out of the box, but adds a second vendor whose
  user/session state must be kept in sync with ProspectFlow's own `Tenant`/`User` rows, and is an
  extra cost line item that Supabase Auth makes unnecessary here.
- *Hand-rolled auth (e.g. NextAuth with credentials)* — rejected: reinventing session/password/
  security handling is exactly the kind of "trendy vs. proven" trade VISION.md says to avoid;
  Supabase Auth is well-documented and battle-tested for this.

**Trade-offs accepted:** Supabase's auth primitives are less purpose-built for multi-tenant SaaS
than Clerk's organization model — ProspectFlow's `Tenant`/`User`/`Role` model is built manually on
top of Supabase Auth rather than inherited from the provider. This is a deliberate, small amount of
extra application code in exchange for one fewer vendor.

**Future implications:** If multi-user tenants with rich role hierarchies become a major product
surface, the manually-built membership model may need to grow substantially — but it grows inside
ProspectFlow's own schema (DATA_MODEL.md `User.role`), not by migrating auth providers.

---

## Why Provider-Agnostic AI Architecture

**Decision:** All AI usage goes through an internal `AIProvider` interface (ARCHITECTURE.md §4),
implemented via the Vercel AI SDK, with task-based routing to different models/providers.

**Why:** AI is core to the product (VISION.md), which means the product cannot be at the mercy of
a single vendor's pricing, availability, or model deprecation schedule. It also allows matching
model capability to task cost-sensitivity: quality-critical tasks (drafting, summaries, proposals)
can use a more capable model, while cheap/fast classification tasks (sentiment, tagging) use a
cheaper one — controlling cost without a rewrite.

**Alternatives considered:**
- *Direct integration with a single provider's SDK throughout the codebase* — rejected: cheaper to
  build initially, but ties the entire product's core value proposition to one vendor's roadmap
  and pricing, which is an unacceptable long-term risk for a product where "AI is a core part of
  the product, not an add-on."
- *Building a custom multi-provider abstraction from scratch* — rejected: the Vercel AI SDK already
  solves this well and is actively maintained; reimplementing it would violate "prefer widely
  adopted, well-documented technologies."

**Trade-offs accepted:** A thin abstraction layer to maintain, and reliance on the Vercel AI SDK's
own abstraction choices/limitations, in exchange for provider flexibility.

**Future implications:** Adding a new provider or changing which model handles which task is a
change confined to `src/modules/ai/`, never a cross-cutting refactor.

---

## Why Multi-Tenant From Day One

**Decision:** The data model and auth system are fully multi-tenant (shared DB, `tenantId` scoping
+ RLS) from the very first migration, even though the MVP has exactly one active tenant.

**Why:** Retrofitting multi-tenancy into a single-tenant schema after the fact is a well-known,
expensive class of migration — every table needs a new required column, every query needs
retroactive scoping, and any accidental cross-tenant leakage during the transition is a serious
trust failure for a product that will hold real business data. Building it in from the start costs
relatively little extra effort now and eliminates that entire risk class later, matching the stated
goal of onboarding new users soon after MVP validation without an architectural rewrite.

**Alternatives considered:**
- *Single-tenant MVP, multi-tenant later* — rejected for the reasons above; explicitly the outcome
  this decision avoids.
- *Database-per-tenant or schema-per-tenant* — rejected as premature: far more operationally
  complex (migrations must run per tenant, connection management multiplies) for a benefit
  (stronger physical isolation) that shared-schema + RLS already provides at this scale.

**Trade-offs accepted:** Slightly more schema and query-layer ceremony from the first migration
(every table needs `tenantId`, every query needs the scoping helper) even while there's only one
real tenant to serve.

**Future implications:** Onboarding additional tenants is a data-creation event, not a schema
migration. If a specific future tenant ever needs stronger physical isolation (e.g. a large
enterprise customer with contractual data-residency requirements), that tenant alone could be
moved to a dedicated database without changing the model for everyone else.

---

## Why Desktop-First

**Decision:** The UI is designed and optimized for desktop first, responsive down to tablet width;
mobile is not a target experience for the MVP.

**Why:** The primary persona (VISION.md) does their actual prospecting — sending messages,
reading replies — on WhatsApp/Instagram directly on their phone, but does their *planning and
triage* (updating ProspectFlow, requesting AI drafts, reviewing conversations) at a desk, the way
they currently use spreadsheets. Building a polished mobile experience for a workflow that isn't
primarily mobile would be effort spent against VISION.md's "solve one workflow extremely well"
principle rather than for it.

**Alternatives considered:**
- *Mobile-first* — rejected: doesn't match actual usage context for the planning/triage workflow
  ProspectFlow owns; the messaging itself already happens on mobile apps ProspectFlow doesn't
  replace.
- *Fully responsive, equal priority* — rejected for the MVP as scope creep relative to actual
  usage; revisited once real usage data says otherwise.

**Trade-offs accepted:** A user who wants to triage leads from their phone has a degraded (though
not broken) experience in the MVP.

**Future implications:** If usage data post-MVP shows meaningful mobile demand, a dedicated
mobile-optimized view can be added without a redesign, since the underlying Server
Component/Action architecture doesn't assume a particular viewport.

---

## Why Manual Outbound Approval (No Automated Sending in MVP)

**Decision:** ProspectFlow never sends a message to a prospect automatically. Every message is
drafted by AI and sent manually by the user, in the MVP and as the enduring default even as
automation is introduced later.

**Why:** This is a trust and quality decision, not just a technical simplification. The product's
core differentiator is human-sounding, rapport-first outreach (VISION.md, PRD FR-2.3) — automated
sending introduces platform-policy risk (WhatsApp/Instagram automation restrictions), removes the
human review step that keeps messages from sounding robotic, and would require building real
channel integrations (WhatsApp Business API, Instagram messaging API) before the core workflow is
even validated.

**Alternatives considered:**
- *Fully automated sending via official APIs from day one* — rejected: highest cost/risk item in
  the entire system (API access approval, compliance, cost-per-message) for a product still
  validating its core drafting/workflow value.
- *Automated sending with an opt-out* — rejected for MVP: reverses the trust default the product is
  built around; better introduced later as an explicit, opt-in evolution once the manual flow is
  proven (VISION.md, Long-Term Vision).

**Trade-offs accepted:** The user does a manual copy/send/log step for every message — more manual
work per prospect than a fully automated tool, in exchange for zero platform-policy risk, zero
channel-integration cost, and messages that stay genuinely human-reviewed.

**Future implications:** Semi-automated and automated sending are explicitly planned (PRD §9,
ARCHITECTURE.md §13) as additive capabilities layered on top of — not replacing — the manual flow.

---

## Why Next.js

**Decision:** Next.js (App Router) is the application framework for both frontend and backend.

**Why:** One language (TypeScript) and one framework across the entire stack minimizes context-
switching for a solo developer, has one of the largest communities and best documentation of any
web framework (directly matching the "widely adopted, well-documented" principle), and its Server
Components/Server Actions model removes the need for a separate API layer for internal app traffic
(ARCHITECTURE.md §8), which is otherwise pure incidental complexity for an app with no external
API consumers yet.

**Alternatives considered:**
- *Separate frontend (React/Vite) + backend (Python/FastAPI or Node/Express)* — rejected: two
  languages/runtimes to maintain, a REST/GraphQL contract to keep in sync, and no benefit for a
  product with no current need for a backend written in a different language.
- *Python backend for AI-heavy workloads* — considered because Python has strong AI/ML library
  support, but rejected because ProspectFlow's AI usage is API calls to hosted models (via the
  Vercel AI SDK), not custom model training/inference — the traditional Python advantage doesn't
  apply here.

**Trade-offs accepted:** None significant at this scale; if a future capability (e.g. heavy custom
data processing for a scraping-based lead source) genuinely needs Python, it can be added as a
separate service communicating with the same database, without disturbing the core app.

**Future implications:** A future public API, mobile app backend, or background worker can be
added as a Route Handler or a separate service respectively, without restructuring the existing
application.

---

## Why Prisma

**Decision:** Prisma is the ORM and migration tool for all database access.

**Why:** Type-safe queries that match TypeScript types generated directly from the schema reduce a
whole class of runtime bugs, and its migration workflow is well-documented and widely adopted —
valuable both for solo-developer velocity and for AI-assisted coding, where a strongly-typed schema
gives an AI pair-programmer strong guardrails against subtly wrong queries.

**Alternatives considered:**
- *Raw SQL / query builder (e.g. Kysely)* — rejected: more control, but more manual type
  maintenance and migration tooling to hand-build; not justified at this project's complexity.
- *A heavier ORM with more abstraction (e.g. TypeORM)* — rejected: Prisma has stronger type
  generation and a simpler mental model for the CRUD-heavy access patterns ProspectFlow needs.

**Trade-offs accepted:** Prisma's query API is less flexible than raw SQL for very complex queries;
acceptable because ProspectFlow's query patterns (tenant-scoped CRUD, simple filters/sorts) don't
need that flexibility yet.

**Future implications:** If a specific query (e.g. complex Momentum analytics at scale) outgrows
Prisma's query builder, Prisma supports raw SQL escape hatches for that one query without
abandoning the ORM everywhere else.

---

## Why Pluggable Lead-Source Architecture (No Committed Source at MVP)

**Decision:** Lead sourcing is built behind a `LeadSourceProvider` interface with only a manual-
entry implementation in the MVP; Instagram, Google Maps, and directory scraping are deferred.

**Why:** Each potential source carries different technical feasibility, platform-policy risk, and
ongoing maintenance cost (scraping is inherently fragile against platform changes) that hadn't been
validated at the time the architecture was designed. Committing to one prematurely risked building
against a source that turns out to be blocked, too expensive, or too fragile to maintain solo.

**Alternatives considered:**
- *Commit to Instagram scraping immediately* — rejected: highest product appeal but highest policy/
  fragility risk, undertaken before validating the rest of the workflow.
- *Commit to a paid third-party data provider* — rejected for MVP: recurring cost before the core
  product is validated; revisit once there's revenue to justify it.

**Trade-offs accepted:** The MVP requires the user to manually enter every prospect — more manual
effort than an automated source would require, in exchange for zero scraping/API risk while the
rest of the product is validated.

**Future implications:** Each future source is an independent, additive implementation behind the
existing interface (ARCHITECTURE.md §13) — adding one never requires touching `Lead` consumers
elsewhere in the app.

---

## Why LGPD-Pragmatic Data Minimization (Not Full Compliance Tooling at MVP)

**Decision:** ProspectFlow only ever collects public business information (DATA_MODEL.md `Lead`
fields) and supports full data deletion, but does not build formal compliance tooling (consent
management, data export/portability workflows, audit dashboards) at the MVP stage.

**Why:** The strongest privacy guarantee available at this stage is architectural, not procedural:
never having a field capable of holding sensitive personal data means there's nothing sensitive to
mishandle. Formal compliance tooling has real value but is disproportionate effort for a single-
tenant MVP; the data-minimization-by-schema-design approach gets most of the real-world protection
at a fraction of the cost.

**Alternatives considered:**
- *Full compliance program at MVP (DPO processes, consent flows, audit trails)* — rejected as
  premature given VISION.md's "avoid unnecessary complexity" principle and the MVP's single-tenant
  reality.
- *Ignore data privacy until it's a legal requirement* — rejected: contradicts an explicit
  principle from discovery ("security, data minimization, responsible data handling are
  architectural principles from the beginning").

**Trade-offs accepted:** No formal audit/export tooling yet; acceptable because the schema itself
never stores data that would make such tooling urgent.

**Future implications:** As tenant count grows, formal LGPD tooling (data export, consent logs)
can be layered on top of a schema that was already designed to minimize what needs to be exported
or consented to in the first place.

---

## Why Momentum Is Rule-Based, Not AI-Computed, in the MVP

**Decision:** The `Momentum` field (PRD §1.4) is computed by deterministic rules (time elapsed,
transition direction, expected-window thresholds), not by an AI model, in the MVP.

**Why:** Momentum needs to be instant, free to compute, and fully explainable — a user needs to
trust why a lead shows as `Cooling` without wondering whether an AI call is stale, expensive, or
inconsistent. A rule-based approach delivers real value immediately with zero AI dependency or
cost, satisfying NFR "reliability" (core workflow must not depend on AI provider uptime).

**Alternatives considered:**
- *AI-computed momentum from the start* — rejected: adds AI cost and latency to a signal that needs
  to update on every Lead list view, and makes an already-hard-to-explain concept ("why is this
  lead Cooling?") dependent on opaque model output.

**Trade-offs accepted:** Rule-based Momentum can't detect qualitative signals (e.g. a lukewarm-
sounding reply that technically counts as "Replied") the way AI sentiment analysis could.

**Future implications:** PRD §9 explicitly plans AI-refined Momentum, blending in sentiment signals
from `AIInteraction` history once conversation text has been analyzed — layered on top of the
rule-based baseline, not replacing it, so Momentum still works even for leads with no pasted
conversation text.

---

## Why the Sales Playbook Is File-Based, Not a Database Entity

**Decision:** The user's sales methodology (opening approach, diagnosis, objection handling,
transitions, pitch, meeting invite, follow-up cadence) lives as version-controlled Markdown in
`src/modules/ai/knowledge/` (`core-rules.md`, `playbook.md`), read at runtime by
`knowledge.service.ts` (ARCHITECTURE.md §4.5). It is not a new `Playbook`/`PlaybookSection`
database entity, has no CRUD, no admin UI, and no migration.

**Why:** An earlier design pass proposed a tenant-scoped database entity (multiple playbooks,
niche tagging, per-tenant overrides) to support a future where ProspectFlow serves many tenants
with different methodologies. The user corrected that framing: ProspectFlow is, today, a tool for
their own single-tenant use, not a SaaS product for managing other people's playbooks — building
multi-tenant playbook infrastructure now would be solving a problem that doesn't exist yet, against
VISION.md's "simplicity beats unnecessary complexity, always" and "the architecture must remain
maintainable by a solo developer." A file the developer edits directly and commits already gives
everything the immediate need requires: a durable place to store the method, and content the AI
prompts read as their primary source of sales strategy (as opposed to the AI inventing one).

**Alternatives considered:**
- *`Playbook`/`PlaybookSection` database entity, tenant-scoped, tagged by stage/niche* — rejected
  for now: requires a migration, a repository, RLS policy, and (eventually) an editing surface for
  content that today has exactly one editor (the developer) and one consumer (their own tenant).
  Real overhead for a capability files already provide. Flagged as the natural next step *if*
  ProspectFlow ever needs multiple playbooks (per-tenant customization, a niche marketplace) —
  the file-based version below is designed so that migration, if it ever happens, is additive, not
  a rewrite.
- *Inlining playbook text directly into `prompts/*.ts`* — rejected: this is what the whole design
  exists to avoid. Editing a sales method would become editing TypeScript, and every refinement
  would need to be threaded through code review as if it were a logic change rather than a content
  change.

**Trade-offs accepted:** No live editing without a redeploy (edit the `.md` file, commit, `main`
redeploys) — irrelevant in practice for a solo user, and identical in shape to how every other
prompt change in this codebase already ships. No per-tenant customization and no database-level
tagging by niche; both were explicitly deferred, not lost — see Future implications.

**Future implications:** The file structure was chosen so a later move to a database-backed model
doesn't require redesigning the *shape* of the knowledge, only its storage: `playbook.md`'s fixed
`## ` headings already correspond 1:1 to the `PlaybookStage` values `knowledge.service.ts` selects
by (`ABERTURA`, `DIAGNOSTICO`, `QUEBRA_OBJECOES`, `TRANSICAO`, `PITCH`, `CONVITE_REUNIAO`,
`FOLLOW_UP`) — if a `PlaybookSection` table is ever built, those headings become its `stage` column
values directly, and the selection logic in `prompts/*.ts` doesn't change, only where
`knowledge.service.ts` reads from.
