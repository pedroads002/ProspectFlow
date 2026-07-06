# ProspectFlow — Product Requirements Document (PRD)

> Companion to [VISION.md](./VISION.md). This document defines *what* is being built. VISION.md
> defines *why*. ARCHITECTURE.md and DATA_MODEL.md define *how*.

## 1. Domain Concepts

These concepts are used consistently across all project documentation and, later, in code.

### 1.1 Lead Lifecycle (Status)

Every prospect ("Lead") moves through a single canonical status field:

| Order | Status | Meaning |
|---|---|---|
| 1 | `New` | Added to ProspectFlow, no first-contact message sent yet |
| 2 | `Contacted` | A first-contact message has been sent manually by the user |
| 3 | `Replied` | The prospect has responded at least once |
| 4 | `Qualified` | The prospect has shown genuine interest; worth continued investment |
| 5 | `Proposal Sent` | A proposal/offer has been sent to the prospect |
| 6 | `Negotiation` | Prospect is actively discussing terms, scheduling, or objections; includes meetings |
| 7a | `Sale Completed` | Terminal — the prospect became a customer |
| 7b | `Lost` | Terminal — the opportunity is closed without a sale |

`Sale Completed` and `Lost` are terminal: a lead does not transition out of them under normal use
(see §7, Business Rules, for reopening rules).

### 1.2 Quick Actions (one-click UI) → Status Mapping

The MVP's primary interaction is a set of one-click buttons, designed so the common case takes
seconds. Quick actions either advance the status or log an event without changing it:

| Quick Action button | Effect |
|---|---|
| **No Reply** | Logs a contact attempt. Status stays `Contacted`. Negatively affects Momentum. |
| **Replied** | Status → `Replied` (from `Contacted`). |
| **Interested** | Status → `Qualified` (from `Replied`). |
| **Follow-up** | No status change. Logs an event and resets the attention window. Used when the conversation is ongoing but hasn't reached a new stage. |
| **Meeting Scheduled** | Status → `Negotiation` (from `Qualified` or `Proposal Sent`). |
| **Sale Completed** | Status → `Sale Completed` (terminal). |
| **Lost** | Status → `Lost` (terminal), from any non-terminal status. |

`Proposal Sent` is reached deliberately (not via a quick-action button) — typically after the user
uses AI-assisted proposal drafting and confirms they sent it. This is intentional: proposal-sending
is a higher-stakes step than the others and warrants a moment of deliberate confirmation rather
than a pure reflex click.

### 1.3 Lead Fields

| Field | Type | Notes |
|---|---|---|
| Name | text | Business or professional name |
| Instagram | text (optional) | Public Instagram handle/URL |
| WhatsApp | text (optional) | Public WhatsApp number |
| Niche | text | e.g. "Dental Clinic", "Aesthetics Clinic" — free text in MVP, tag-like in future |
| Notes | long text (optional) | Freeform user notes |
| Status | enum | See §1.1 |
| Momentum | derived enum | See §1.4 — not directly user-editable |

(Full field list including system/audit fields is in [DATA_MODEL.md](./DATA_MODEL.md).)

### 1.4 Momentum

**Momentum is ProspectFlow's answer to "which of my leads actually need my attention today?"** It
is a derived, system-computed indicator of whether a lead's engagement is heating up, holding
steady, or going cold — distinct from Status, which only tracks *stage*, not *urgency* or *health*.

Two leads can share a status (e.g. both `Contacted`) while being in very different situations: one
was contacted an hour ago, the other three weeks ago with silence since. Status alone can't
distinguish them. Momentum can.

**Momentum values (MVP):**

| Value | Meaning |
|---|---|
| `Rising` | Recent forward movement (a status advance, or a reply) within the expected window for the current stage. |
| `Steady` | Within the expected window for the current stage; no red flags, but no fresh forward movement either. |
| `Cooling` | Past the expected window for the current stage with no forward movement — a signal to follow up soon. |
| `Stalled` | Significantly overdue (roughly 2x the expected window) with no activity — a signal to either force a follow-up or consider marking `Lost`. |

**MVP computation (rule-based, not AI):** Momentum is recalculated whenever a lead is viewed or
updated, using:
1. Time elapsed since the last status change or logged event (`lastActivityAt`).
2. Direction of the most recent event (a forward status transition or a "Replied" event resets
   Momentum to `Rising`; a "No Reply" event pushes it toward `Cooling`/`Stalled`).
3. A default expected-response window per status (configurable per tenant later; MVP ships with
   sensible defaults, e.g. ~5 days for `Contacted`, ~3 days for `Replied`, ~7 days for `Qualified`
   and `Proposal Sent`, ~14 days for `Negotiation`).

Momentum is intentionally **not** AI-computed in the MVP — it must be cheap, instant, and fully
explainable. Once AI conversation assistance is used on a lead (pasted conversation text),
sentiment signals from that analysis may refine Momentum in a later phase (see §9, Future Scope),
but the MVP's rule-based version must work correctly with zero AI involvement.

Momentum is surfaced in the lead list as a primary sort/filter dimension — it is the mechanism
that lets a user open ProspectFlow and immediately see who needs attention, without reading every
lead's history.

---

## 2. Functional Requirements

### FR-1 — Prospect (Lead) Management
- FR-1.1: User can manually create a Lead with the fields in §1.3.
- FR-1.2: User can edit any Lead field at any time.
- FR-1.3: User can delete a Lead, which permanently removes all associated data (messages,
  conversation logs, AI outputs) — see LGPD requirements in §3.
- FR-1.4: User can list, search, and filter Leads by Status, Momentum, and Niche.
- FR-1.5: Lead creation must support the future addition of non-manual sources without schema or
  workflow changes (see ARCHITECTURE.md, Lead Source Provider abstraction) — MVP ships only the
  manual-entry source.

### FR-2 — AI Message Drafting
- FR-2.1: For any Lead without a sent first-contact message, the user can request an AI-drafted
  first-contact message.
- FR-2.2: The draft must be generated using: (a) the Lead's public info fields (Instagram, Niche,
  Notes), (b) the user's commercial profile/value proposition, (c) the user's defined tone/style
  preferences, and (d) prior conversation history with that Lead, if any.
- FR-2.3: The draft's goal is explicitly to open a natural conversation and build rapport/curiosity
  — not to pitch. Prompts and generated content must avoid salesy or marketing-agency phrasing.
  This is a product requirement, not just a prompt-tuning preference (see PRD §7, Business Rules).
- FR-2.4: The user can edit the draft freely before considering it "sent."
- FR-2.5: The user manually sends the message outside ProspectFlow (WhatsApp/Instagram) and then
  marks it as sent, which transitions the Lead's status to `Contacted` and timestamps the event.
- FR-2.6: The system must never send a message to a prospect automatically in the MVP.

### FR-3 — Quick Status Updates
- FR-3.1: Every Lead's list/detail view exposes the Quick Action buttons from §1.2.
- FR-3.2: A Quick Action must be completable in a single click/tap with no required additional
  input (optional text paste is a separate, secondary action — see FR-4).
- FR-3.3: Quick Actions must enforce valid status transitions only (see §7, Business Rules) and
  silently no-op or disable invalid transitions in the UI (e.g. no "Interested" button on a
  `Negotiation` lead).
- FR-3.4: Each Quick Action updates `lastActivityAt` and triggers Momentum recomputation.

### FR-4 — AI Conversation Assistance (optional, on-demand)
- FR-4.1: The user can optionally paste raw conversation text against a Lead at any time.
- FR-4.2: When conversation text is submitted, the AI must be able to produce, depending on
  relevance to the current stage: a concise summary, sentiment/buying-signal read, identified
  objections, a suggested next message matching the user's tone, a suggested follow-up strategy,
  a recommended next action, and/or a proposal draft.
- FR-4.3: Outputs must be modular — the UI shows only what's relevant to the current conversation
  stage, not a fixed block of every possible output.
- FR-4.4: All AI outputs must be short and actionable by default (see NFR on AI output length,
  §3). No output should require the user to read more than a few sentences to get value from it.
- FR-4.5: Pasted conversation text is stored (associated with the Lead) so future AI assistance
  has continuity — see FR-2.2(d).

### FR-5 — Proposal Assistance
- FR-5.1: When a Lead's conversation reaches a proposal-appropriate stage (typically `Qualified`
  or later), the user can request an AI-drafted proposal as plain text, based on the full
  conversation context and the user's value proposition.
- FR-5.2: The user edits/finalizes the proposal and sends it manually outside ProspectFlow.
- FR-5.3: Confirming a proposal was sent transitions the Lead's status to `Proposal Sent`.
- FR-5.4: MVP proposal output is plain text only — no PDF generation, branding, or document
  templating.

### FR-6 — User Profile / Commercial Context
- FR-6.1: The user configures, once, their commercial profile: what they sell, their value
  proposition/expertise, and their preferred communication tone/style.
- FR-6.2: This profile is used as an input to every AI drafting operation (FR-2, FR-4, FR-5) and
  can be edited at any time; edits apply to future drafts only, not retroactively.

### FR-7 — Authentication & Multi-Tenancy
- FR-7.1: Every user belongs to exactly one tenant (organization/account).
- FR-7.2: All Lead, message, and conversation data is scoped to a tenant; no user can access
  another tenant's data under any circumstance.
- FR-7.3: The MVP ships with a single tenant in active use, but the schema, auth, and query layers
  must behave identically whether there is 1 tenant or 100 (no MVP-only shortcuts that bypass
  tenant scoping).

### FR-8 — Data Deletion
- FR-8.1: Deleting a Lead removes all of its associated data (messages, pasted conversation text,
  AI outputs) — no soft "archive with residual data" state is required for LGPD purposes, though
  the underlying implementation may use a soft-delete window purely for accidental-deletion
  recovery (see DATA_MODEL.md).

---

## 3. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Usability** | Desktop-first, responsive down to tablet width. Not required to be a great mobile experience in the MVP, but must not break on mobile. |
| **Speed of core loop** | Updating a Lead's status via Quick Action must feel instantaneous (optimistic UI update, sub-200ms perceived latency). |
| **AI output brevity** | AI-generated summaries, suggestions, and recommendations must be concise by design — optimized for a fast decision, not a long read. This is a hard product requirement enforced at the prompt/response-shaping layer, not a nice-to-have. |
| **AI provider independence** | The AI layer must not be hard-coded to a single provider. Swapping or mixing providers (Anthropic, OpenAI, Google) per task type must not require changes outside the AI module. |
| **Data privacy (LGPD-pragmatic)** | Only public business data is collected (see §1.3). No sensitive personal data fields exist in the schema. Users can fully delete a Lead's data on demand. |
| **Multi-tenant isolation** | Tenant data isolation is enforced at the data-access layer, not just the UI. A bug in one screen must not be able to leak cross-tenant data. |
| **Reliability** | Core workflow (add Lead → draft message → log status) must not depend on AI provider uptime — if AI drafting fails, the user can still manually write a message and log status. |
| **Maintainability** | Solo-developer-maintainable: no infrastructure or pattern that requires a dedicated ops/platform engineer to operate. |
| **Cost** | MVP infrastructure and AI usage costs must scale near-zero at low usage (pay-as-you-go services, no fixed high-cost infrastructure). |

---

## 4. User Flows

### 4.1 Add Lead → First Contact
1. User manually adds a Lead (Name, Instagram/WhatsApp, Niche, Notes).
2. User requests an AI-drafted first-contact message.
3. AI generates a draft using Lead info + user's commercial profile + tone settings.
4. User edits the draft if desired.
5. User copies the message and sends it manually via WhatsApp or Instagram.
6. User marks it as sent → status becomes `Contacted`, Momentum → `Rising`.

### 4.2 Daily Triage Loop
1. User opens ProspectFlow; Lead list is sorted/filterable by Momentum.
2. User scans `Cooling`/`Stalled` leads first (attention needed) and `Rising` leads (worth
   following up while hot).
3. For most leads, user taps a single Quick Action (`No Reply`, `Replied`, `Follow-up`, etc.).
4. For leads with a substantive new reply, user optionally pastes the conversation text.

### 4.3 AI-Assisted Conversation Handling
1. User pastes new conversation text against a Lead.
2. AI returns only the relevant modular outputs for the current stage (e.g. sentiment + suggested
   next message for an early conversation; objections + recommended action for a stalled one).
3. User acts on the recommendation: sends a suggested message manually, updates status via Quick
   Action, or requests a proposal draft.

### 4.4 Proposal Flow
1. Lead reaches `Qualified` (or later) with clear buying signal.
2. User requests an AI-drafted proposal from the Lead's full context.
3. User edits and sends the proposal manually.
4. User confirms it was sent → status becomes `Proposal Sent`.

---

## 5. User Stories & Acceptance Criteria

**US-1: As a consultant, I want to add a new prospect in seconds, so I can capture leads as I find
them without breaking my flow.**
- Given I am on the Lead list, when I click "Add Lead" and enter at least a Name, then the Lead is
  created with status `New` and appears at the top of the list.

**US-2: As a consultant, I want the AI to draft a first-contact message that sounds like me, not
like a sales script, so the prospect responds naturally instead of feeling pitched.**
- Given a Lead with at least a Niche and one of Instagram/WhatsApp/Notes filled in, when I request
  a draft, then I receive a message that references something specific to that prospect, reflects
  my configured tone, and contains no pricing, sales-pitch language, or agency-style phrasing.

**US-3: As a consultant, I want to update most leads with a single click, so my daily admin work
takes minutes, not hours.**
- Given a Lead in `Contacted` status, when I click "No Reply," then the Lead's status is unchanged,
  `lastActivityAt` updates, and Momentum recalculates — all without a page reload or additional
  input.

**US-4: As a consultant, I want to paste a conversation and get a short, actionable read on where
things stand, so I can decide what to do next without re-reading the whole thread myself.**
- Given a Lead with pasted conversation text, when I request AI assistance, then I receive at most
  the outputs relevant to that stage (never the full fixed set), each expressed in a few sentences
  or less.

**US-5: As a consultant, I want the system to tell me which leads are going cold, so I don't lose
opportunities to simple forgetfulness.**
- Given a Lead has had no forward-moving activity for longer than its stage's expected window,
  when I view the Lead list, then that Lead's Momentum shows `Cooling` or `Stalled` and it can be
  filtered/sorted to the top.

**US-6: As a consultant, I want to generate a proposal draft from the conversation history, so I
don't start from a blank page at the highest-stakes point in the process.**
- Given a Lead in `Qualified` or later with conversation history, when I request a proposal draft,
  then I receive plain-text proposal content referencing specifics from the conversation and my
  value proposition, which I can edit before sending.

**US-7: As the platform owner, I want every tenant's data fully isolated, so that adding future
users never risks data leaking between accounts.**
- Given two tenants each with Leads, when either tenant's user queries their Lead list, then only
  their own tenant's Leads are ever returned, enforced independent of which UI screen makes the
  request.

---

## 6. MVP Scope

Included:
- Manual Lead entry and management (FR-1, manual source only).
- AI first-contact and follow-up message drafting for WhatsApp/Instagram content, human-sent
  (FR-2).
- One-click status Quick Actions (FR-3).
- Optional paste-based AI conversation assistance, modular output (FR-4).
- Plain-text AI-assisted proposal drafting (FR-5).
- User commercial profile/tone configuration (FR-6).
- Multi-tenant-ready auth and data model, single active tenant (FR-7).
- Full Lead deletion (FR-8).

## 7. Business Rules

1. **Status transitions are constrained**, not freeform:
   - `New → Contacted` (via marking first-contact message as sent)
   - `Contacted → Replied` (via "Replied" Quick Action)
   - `Replied → Qualified` (via "Interested" Quick Action)
   - `Qualified → Negotiation` or `Proposal Sent → Negotiation` (via "Meeting Scheduled")
   - `Qualified/Negotiation → Proposal Sent` (via confirmed proposal send)
   - Any non-terminal status `→ Lost` (via "Lost" Quick Action)
   - Any non-terminal status `→ Sale Completed` (via "Sale Completed" Quick Action)
   - `Sale Completed` and `Lost` are terminal; reopening a terminal Lead requires an explicit,
     separate "reopen" action (not a Quick Action), to prevent accidental status corruption.
2. **No automatic outbound sending.** No system-initiated message ever reaches a prospect in the
   MVP, without exception.
3. **AI drafts are never final.** A draft is always a proposal to the user, never auto-submitted
   as a sent message; "marking as sent" is a distinct, explicit user action from "generating a
   draft."
4. **Momentum is derived, not directly editable.** Users influence it only indirectly, through
   Quick Actions and status changes — there is no manual Momentum override in the MVP.
5. **Tenant scoping is mandatory on every data access**, with no exceptions for "convenience"
   endpoints or admin tooling.
6. **Deleting a Lead is permanent** for all practical purposes (subject only to a short
   accidental-deletion recovery window at the infrastructure level, not exposed as a product
   feature).

## 8. Out of Scope (MVP and near-term)

- Any form of automated or scheduled message sending.
- Direct API integrations with WhatsApp Business, Instagram, or email providers.
- Any lead-sourcing provider beyond manual entry (Instagram/Google Maps/directory scraping are
  future work, explicitly deferred — see ARCHITECTURE.md).
- CRM-style features: deal pipelines beyond the Lead lifecycle, invoicing, contracts, calendar
  scheduling/integration, task management unrelated to prospecting.
- Formatted/branded proposal documents (PDF, templating).
- Team/role-based permissions beyond basic tenant ownership (multi-user-per-tenant collaboration
  features are future work).
- Mobile-native apps.
- Analytics dashboards/reporting beyond what's needed to view Momentum and status in the Lead
  list.

## 9. Future Scope

- Additional `LeadSourceProvider` implementations (Instagram, Google Maps, public directories),
  added independently as feasibility/ToS/cost are validated.
- Semi-automated and eventually optional automated sending, with human approval remaining
  available as the default mode.
- AI-refined Momentum incorporating sentiment signals from pasted conversations.
- Multi-user tenants with shared visibility and basic roles.
- Formatted proposal documents.
- Follow-up scheduling/reminders beyond the passive Momentum signal.
