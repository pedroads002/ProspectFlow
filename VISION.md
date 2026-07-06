# ProspectFlow — Vision

> *ProspectFlow exists so commercial professionals spend more time building relationships and
> less time operating spreadsheets, notes, and repetitive tasks.*

## Mission

Help commercial professionals spend less time operating prospecting tasks and more time building
the relationships that generate business. Every part of this document, and every decision made
downstream of it, serves that single mission — not feature growth for its own sake.

## What ProspectFlow Is

ProspectFlow is an AI-driven commercial operating system for outbound prospecting, built for
consultants and commercial professionals who sell services to small and medium businesses. It is
not just a tool for sending messages — it is the system that organizes, tracks, and strengthens
the entire early commercial process: finding prospects, drafting first-contact messages, keeping
track of conversations, and preparing proposals — while keeping the human fully in control of
every message that actually goes out.

The focus remains squarely on outbound prospecting — ProspectFlow does not become a CRM (see
"What ProspectFlow Is NOT" below) — but its positioning is deliberately broader than "a
prospecting tool": it is the operating layer a commercial professional runs their active
prospecting practice on, from the moment a prospect is identified to the moment a proposal is on
the table.

The first target niche is dental clinics and advanced aesthetics professionals in Brazil, chosen
because they are numerous, reachable through public channels (Instagram, WhatsApp, Google Maps),
and currently prospected almost entirely by hand.

ProspectFlow exists to compress the time between "I found a business that might be a good fit"
and "I'm having a real conversation with the decision-maker," without making that conversation
feel automated.

## What ProspectFlow Is NOT

- **It is not a CRM.** It does not aim to replace deal pipelines, invoicing, contracts, calendars,
  or general customer relationship management. It is deliberately narrow: it owns the outbound
  prospecting workflow, from first contact through proposal, and stops there.
- **It is not a mass-messaging or spam tool.** There is no bulk-blast mode. Every message is
  reviewed and sent by a human, one conversation at a time.
- **It is not a chatbot that talks to prospects.** The AI never communicates with a prospect
  directly. It drafts; the human decides and sends.
- **It is not a lead marketplace.** It does not sell or share lead data between users. Prospect
  data belongs to the tenant that captured it.
- **It is not a feature-maximalist platform.** It intentionally resists becoming a general sales
  suite. Every feature must serve the single workflow of outbound prospecting.

## Product Philosophy

1. **AI automates repetitive work; it never replaces the human relationship.** The value of
   outbound prospecting in this market is a real person building rapport with another real
   person. The AI's job is to remove the blank-page problem and the busywork of tracking
   conversations — not to simulate the relationship itself.
2. **Every outbound message is reviewed by the user before it leaves the system.** ProspectFlow
   never sends a message on the user's behalf in the MVP, and even as automated/semi-automated
   sending is introduced later, human approval remains the default and the trust boundary the
   product is built around.
3. **Simplicity beats unnecessary complexity, always.** When a feature can be built two ways,
   ProspectFlow takes the simpler one, even if it is less impressive on paper — for the
   architecture, the UI, and the workflow itself.
4. **Solve one workflow extremely well before expanding.** The MVP does not attempt to cover
   every lead source, every channel, or every stage of the sales cycle. It nails outbound
   first-contact and conversation management for one channel pair (WhatsApp/Instagram) before
   growing outward.
5. **Speed of daily use matters more than feature count.** A consultant using ProspectFlow every
   day should be able to update most prospects in a few seconds (one click). Anything that adds
   friction to that daily loop is a defect, not a missing feature.
6. **The architecture must remain maintainable by a solo developer assisted by AI.** Every
   technical decision is filtered through this constraint: will this still be understandable and
   changeable by one person, working with an AI pair-programmer, a year from now?
7. **Time is the most important asset ProspectFlow gives back.** The single greatest objective of
   the product is to return time to the user. Every feature built must reduce repetitive work,
   save time, or let the user spend more of their day talking to people and less of it operating
   tools — if a feature doesn't do at least one of these, it doesn't belong in ProspectFlow.

## Core Principles

Before any new feature is built, it must answer these questions — mostly affirmatively:

- Does it save time?
- Does it increase productivity?
- Does it reduce operational work?
- Does it improve the quality of commercial relationships?
- Does it keep the product simple?
- Does it stay aligned with ProspectFlow's vision?

If the answer is negative for most of these questions, the feature most likely does not belong in
ProspectFlow, regardless of how appealing it seems in isolation. This checklist is the practical,
day-to-day enforcement mechanism for the philosophy above — it exists so scope decisions can be
made quickly and consistently, without relitigating first principles every time.

## Long-Term Vision

ProspectFlow becomes the default outbound layer for independent consultants and small commercial
teams selling into local service businesses — not just dental/aesthetics, but any vertical where
outbound is currently done manually through WhatsApp/Instagram/email and where relationship-driven,
human-sounding outreach outperforms generic automation.

Over time:
- Lead sourcing grows from manual entry into a set of pluggable providers (Instagram, Google Maps,
  public directories, and others), each independently swappable as feasibility and platform policy
  allow.
- Outreach evolves from fully manual sending, to semi-automated (AI prepares and schedules, human
  approves in bulk), to optionally automated for channels and users that want it — but manual,
  human-approved sending never disappears as an option.
- The AI layer deepens from drafting and summarizing into proactive prioritization: telling the
  user which handful of prospects deserve attention today, and why.
- The platform grows from single-user to true multi-tenant SaaS, supporting small teams that share
  visibility into prospecting activity without becoming a general CRM.

**ProspectFlow is envisioned, from the start, as a platform built on specialized AI agents rather
than a single general-purpose assistant.** Different agents are responsible for different parts of
the commercial workflow — for example, lead discovery, lead qualification, outreach generation,
follow-up strategy, conversation intelligence, and proposal generation. This document does not
prescribe how those agents are implemented; that is an architectural concern to be designed when
each capability is actually built. What belongs in the vision is the commitment itself: ProspectFlow
is not a single AI feature bolted onto a database, it is a system designed around cooperating,
specialized agents, each doing one part of the commercial process well.

## MVP Vision

Prove — with real, daily outbound activity in the dental/aesthetics niche — that a single
consultant using ProspectFlow can prospect faster and more consistently than working from a
spreadsheet or notes app, without the outreach feeling automated to the people receiving it.

The MVP is intentionally narrow:
- One user, real usage, real prospects.
- Leads are registered manually in the MVP — but the underlying architecture is already built for
  the future evolution toward automatic lead discovery, so that transition never requires
  restructuring the platform (see ARCHITECTURE.md's `LeadSourceProvider` abstraction).
- AI-drafted first-contact and follow-up messages for WhatsApp and Instagram, sent manually.
- One-click status updates as the default interaction.
- Optional, on-demand AI assistance (summary, sentiment, objections, next message, next action,
  proposal draft) when the user pastes conversation text.
- Multi-tenant data model from day one, even though only one tenant exists at first.

Success at the MVP stage is measured by whether the product gets used every day, not by feature
completeness.

## Target Audience

**Primary persona:** ProspectFlow's ideal user is a professional who sells knowledge, consulting,
or commercial implementation — not a physical product, and not a pure marketing service. Concretely,
this includes profiles such as:
- commercial/sales consultants;
- CRM implementation specialists;
- professionals who implement or redesign commercial processes for client businesses;
- consultants who help businesses grow their revenue or sales operations.

What these profiles share is the underlying persona this document has always described: an
independent consultant or small commercial professional who sells services to local businesses and
who currently prospects manually via WhatsApp and Instagram, tracking everything in spreadsheets,
notes apps, or memory. The initial target niche for validating this persona remains dental clinics
and advanced aesthetics professionals in Brazil.

Characteristics:
- Technically comfortable but not technical — no patience for complex tooling.
- Values speed and results over configurability.
- Already has a personal communication style and doesn't want to sound like a script.
- Sends dozens of first-contact messages and follow-ups per week, largely by hand.

**Secondary (future) persona:** Small commercial teams (2–10 people) inside an agency or growing
consultancy who want shared visibility into outbound activity without adopting a full CRM.

## Business Goals

1. Validate that AI-assisted, human-approved outbound prospecting measurably increases reply and
   conversion rates compared to fully manual prospecting, in the dental/aesthetics niche.
2. Build a product a solo developer can operate and extend indefinitely without a team, keeping
   operating costs low relative to revenue potential.
3. Establish an architecture that lets ProspectFlow expand into new lead sources, channels, and
   verticals without re-architecting the core.
4. Create the foundation for a multi-tenant SaaS business, even though the MVP has one user.

## Success Metrics

MVP-stage metrics (qualitative and lightweight — no analytics infrastructure required at this
stage):
- **Daily usage:** the user opens and updates ProspectFlow most working days.
- **Time to first contact:** time from adding a prospect to sending a first message drops
  meaningfully compared to manual drafting.
- **Reply rate:** the proportion of first-contact messages that get a reply, tracked via the
  one-click status system.
- **Friction:** routine status updates take a few seconds, not minutes — measured by whether the
  user actually keeps the data up to date during real use (the strongest signal that the workflow
  isn't fighting them).
- **Conversation-to-proposal rate:** the proportion of "Qualified" conversations that reach
  "Proposal Sent," as a proxy for whether AI assistance is actually helping close the gap.

Post-MVP metrics (once multiple tenants exist) will add cross-tenant retention, message volume per
active user, and conversion-rate benchmarks by niche — to be formalized once there is real
multi-tenant usage to measure.

## Status vs. Momentum

ProspectFlow's data model (see PRD.md and DATA_MODEL.md) tracks two distinct, complementary
concepts for every lead: **Status** and **Momentum**.

Status represents the commercial stage a lead is in — where it sits in the lifecycle, from first
contact through proposal to close. Momentum represents something different: the current level of
movement, engagement, and health of that opportunity, independent of stage. Two leads can share the
same Status while being in very different situations — one freshly contacted, one gone quiet for
weeks — and Momentum is what makes that difference visible at a glance. This document does not
define how Momentum is calculated; that is a product/technical detail covered in PRD.md. What
matters here is the concept: Status answers "where is this lead," Momentum answers "how alive is
this lead right now."

## Product Values

- **Human-first automation.** AI amplifies a person's ability to have good conversations; it does
  not stand in for them.
- **Trust through transparency.** The user always sees what the AI is suggesting and why, and
  always has final say before anything is sent.
- **Respect for the prospect.** No spam, no mass-blasting, no deceptive automation — every message
  is meant to read as genuinely personal, because it is genuinely reviewed by a person.
- **Data minimalism.** Collect only the public business information needed to prospect well;
  never collect sensitive personal data; make it easy to delete a prospect's data.
- **Sustainable simplicity.** Prefer boring, well-understood technology and small, clear scope
  over novelty, so the product remains maintainable for years by a small team.
