# AI Module

Owns the provider-agnostic `AIProvider` interface, task-to-model routing, prompt construction,
and response shaping (brevity, structure). It is the only module allowed to call an AI SDK
directly. See [ARCHITECTURE.md](../../../ARCHITECTURE.md#4-ai-architecture).

- `ai.service.ts` — public surface; other modules import only from here.
- `provider.interface.ts` — the `AIProvider` contract. Sprint 2 implements only
  `draftFirstContactMessage`/`draftFollowUpMessage`; `summarizeConversation`, `analyzeSentiment`,
  `suggestNextAction`, and `draftProposal` are added in Sprint 3.
- `router.ts` — the one file that maps task → provider/model. Change this to add a provider or
  rebalance which model handles which task.
- `providers/anthropic.provider.ts` — the MVP's only concrete provider, using the Vercel AI SDK.
- `prompts/` — prompt construction, one file per task; enforces PRD FR-2.3 (rapport, not a pitch)
  and brevity at the prompt layer, not left to chance.

Requires `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_DRAFTING_MODEL`) in `.env` — see
`.env.example`.
