# ProspectFlow — MVP Backlog

> Implements [PRD.md](./PRD.md) MVP Scope (§6) using the architecture in
> [ARCHITECTURE.md](./ARCHITECTURE.md), following the iterative approach in
> [VISION.md](./VISION.md): a small solid foundation, validated by real daily use, improved
> incrementally. Every sprint ends with something usable, even if narrow.

Sizing uses T-shirt estimates (S / M / L / XL) reflecting effort for a solo developer working
with an AI pair-programmer — not calendar time, since there is no fixed deadline (VISION.md).

---

## Sprint 0 — Technical Foundation

**Goal:** A deployed, empty ProspectFlow shell with auth and tenancy working end-to-end. No
product features yet — this sprint exists so every later sprint is additive, not foundational.

**Deliverables:**
- Next.js + TypeScript project scaffolded per the folder structure in ARCHITECTURE.md §9.
- Supabase project created; Postgres + Auth configured.
- Prisma installed; initial migration for `Tenant`, `User`, `CommercialProfile` (DATA_MODEL.md
  §3.1–3.3).
- Sign-up/sign-in flow via Supabase Auth; first sign-in creates a `Tenant` + `User` (role
  `OWNER`).
- Tenancy module's scoped-access helper implemented and used by at least one real query (proves
  the pattern works before other modules depend on it).
- Vercel project connected; deploys on push to `main`; preview deployments on branches.
- Empty authenticated dashboard shell (no Lead features yet).

**Estimated complexity:** M

**Dependencies:** None — this is the starting point.

**Definition of Done:**
- A user can sign up, sign in, and land on an authenticated dashboard.
- A `Tenant` and `User` row exist in the database after sign-up, correctly linked.
- Tenant-scoped query helper exists and is demonstrably used (not just written).
- Production deployment is live at a real URL.

---

## Sprint 1 — Lead Management

**Goal:** The user can manage their real pipeline of prospects manually, with no AI involvement
yet. This alone should be usable in place of a spreadsheet.

**Deliverables:**
- `Lead` entity + migration (DATA_MODEL.md §3.4).
- Lead list page: create, view, edit, delete; search and filter by `status` and `niche`.
- Lead detail page showing all fields.
- `CommercialProfile` settings page (value proposition, tone description, services) — required
  before AI features in Sprint 2 can function, so it's seeded here.
- Full deletion flow (PRD FR-1.3): deleting a Lead removes it and is irreversible from the user's
  perspective.
- Desktop-first responsive layout established for the dashboard shell.

**Estimated complexity:** M

**Dependencies:** Sprint 0 (tenancy + auth + deployed shell).

**Definition of Done:**
- User can add a real prospect with Name, Instagram/WhatsApp, Niche, Notes and see it in the list.
- User can edit and delete a Lead; deletion actually removes the row (verified in DB).
- Commercial profile can be saved and reloaded correctly.
- No cross-tenant data leakage when tested with two tenants (manual verification against FR-7.2).

---

## Sprint 2 — AI Drafting, Quick Actions, and Momentum

**Goal:** The full daily-use loop works end-to-end: add a lead, get an AI-drafted first-contact
message, send it manually, and track status/momentum with one-click updates. This is the sprint
that makes ProspectFlow actually useful for real prospecting, not just record-keeping.

**Deliverables:**
- AI module scaffolded per ARCHITECTURE.md §4: provider interface, Vercel AI SDK integration,
  task-routing config, Anthropic as the first concrete provider.
- First-contact and follow-up message drafting (PRD FR-2), using Lead fields + Commercial Profile
  + tone settings as input.
- `OutboundMessage` entity + migration (DATA_MODEL.md §3.6); draft → edit → "mark as sent" flow.
- `LeadEvent` entity + migration (DATA_MODEL.md §3.5); every Quick Action and status change
  writes an event.
- Quick Action buttons wired to the status transition rules in PRD §7 (No Reply, Replied,
  Interested, Follow-up, Meeting Scheduled, Sale Completed, Lost).
- Momentum computation service (`Rising`/`Steady`/`Cooling`/`Stalled`) per PRD §1.4, recalculated
  on Lead read/write; Lead list sortable/filterable by Momentum.
- AI failure isolation: if the AI call fails, the rest of the workflow (manual message entry,
  status updates) remains fully usable.

**Estimated complexity:** L

**Dependencies:** Sprint 1 (Lead entity, Commercial Profile).

**Definition of Done:**
- Requesting a draft for a real Lead produces a message referencing that Lead's specifics and the
  configured tone — verified by the user's own judgment on a handful of real prospects, not just
  automated tests.
- Marking a message as sent transitions status to `Contacted` and logs a `LeadEvent`.
- Each Quick Action updates status/Momentum correctly and only allows valid transitions (PRD §7.1).
- Momentum visibly changes over time on a Lead left untouched past its expected window (can be
  tested by backdating `lastActivityAt` in a seed script).
- AI provider outage (simulated) does not block status updates or manual message logging.

---

## Sprint 3 — Conversation Assistance & Proposals

**Goal:** Complete the workflow described in VISION.md's MVP Vision: the user can paste a real
conversation and get modular, actionable AI assistance, and can generate a proposal draft when a
conversation is ready for one.

**Deliverables:**
- `ConversationEntry` entity + migration (DATA_MODEL.md §3.7); paste-conversation UI on the Lead
  detail page.
- `AIInteraction` entity + migration (DATA_MODEL.md §3.8), recording every AI assistance call for
  auditability.
- Modular AI assistance outputs (PRD FR-4): summary, sentiment/buying signals, objections,
  suggested next message, suggested follow-up strategy, recommended next action — each shown only
  when relevant to the Lead's current stage, each concise by construction (NFR in PRD §3).
- Proposal drafting (PRD FR-5): AI-drafted plain-text proposal from full Lead + conversation
  context; "confirm sent" transitions status to `Proposal Sent`.
- Lead detail timeline view rendering the full `LeadEvent` + `OutboundMessage` +
  `ConversationEntry` history in chronological order.

**Estimated complexity:** L

**Dependencies:** Sprint 2 (AI module, OutboundMessage, LeadEvent).

**Definition of Done:**
- Pasting a real conversation produces at least one relevant, concise, correct-sounding AI output
  for that stage — validated against real conversations from actual prospecting, not synthetic
  test data.
- Proposal draft generation produces text that references specifics from the conversation and the
  Commercial Profile, editable before being marked sent.
- Lead detail page tells a complete, readable story of a Lead's history from a single screen.
- This sprint marks MVP feature-completeness per PRD §6 — after this, focus shifts to real daily
  use and iteration, not new features, per VISION.md's iterative approach.

---

## Future Roadmap (post-MVP, unordered — prioritized after real usage data)

These are deferred by design (PRD §9), not forgotten:

- **Pluggable lead source providers** — Instagram, Google Maps, public directories, implemented
  one at a time behind the existing `LeadSourceProvider` interface (ARCHITECTURE.md §13), each
  validated for feasibility/ToS/cost before being built.
- **Semi-automated and automated sending** — starting with the lowest-risk channel, with manual
  sending remaining permanently available.
- **AI-refined Momentum** — incorporating sentiment signals from `AIInteraction` history rather
  than pure time-based rules.
- **Multi-user tenants and roles** — extending the Tenancy module's membership model; likely to
  also require moving `CommercialProfile` from per-Tenant to per-User (flagged in DATA_MODEL.md
  §3.3).
- **Formatted/branded proposal documents** — PDF generation and templating.
- **Follow-up scheduling/reminders** — proactive nudges beyond the passive Momentum signal.
- **Usage/cost analytics per tenant** — built on the `AIInteraction` audit log already in place.
