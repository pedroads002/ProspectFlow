# AI Module

Owns the provider-agnostic `AIProvider` interface, task-to-model routing, prompt construction,
and response shaping (brevity, structure). It is the only module allowed to call an AI SDK
directly. See [ARCHITECTURE.md](../../../ARCHITECTURE.md#4-ai-architecture).

- `ai.service.ts` — public surface; other modules import only from here. Every call is logged to
  `AIInteraction` here, in one place, so no caller can forget to record one.
- `provider.interface.ts` — the `AIProvider` contract: `draftFirstContactMessage`,
  `draftFollowUpMessage`, `analyzeConversation` (PRD FR-4 — one combined, modular call), and
  `draftProposal` (PRD FR-5).
- `router.ts` — the one file that maps task → provider/model. Change this to add a provider or
  rebalance which model handles which task.
- `ai-interaction.repository.ts` — tenant-scoped audit log (DATA_MODEL.md §3.8).
- `providers/anthropic.provider.ts` — the MVP's only concrete provider, using the Vercel AI SDK
  (`generateText` for message/proposal drafts, `generateObject` for the structured conversation
  analysis).
- `prompts/` — prompt construction, one file per task; enforces PRD FR-2.3/FR-4.4 (rapport, not a
  pitch; brevity) at the prompt layer, not left to chance.
- `knowledge/` — the user's sales playbook (`core-rules.md`, `playbook.md`), version-controlled
  Markdown, not a database entity (DECISIONS.md "Why the Sales Playbook Is File-Based").
  `knowledge.service.ts` reads and assembles it into task-relevant fragments; `prompts/*.ts` are
  the only consumers. Edit the `.md` files directly to change what the AI's drafts/analysis are
  grounded in — no code change needed for a content change.

Requires `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_DRAFTING_MODEL`) in `.env` — see
`.env.example`. Also requires `src/modules/ai/knowledge/*.md` to ship in the deployed serverless
bundle — see `outputFileTracingIncludes` in `next.config.ts`.
