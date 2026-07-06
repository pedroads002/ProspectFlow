# AI Module

Owns the provider-agnostic `AIProvider` interface, task-to-model routing, prompt construction,
and response shaping (brevity, structure). It is the only module allowed to call an AI SDK
directly. See [ARCHITECTURE.md](../../../ARCHITECTURE.md#4-ai-architecture).

Implemented starting in Sprint 2 (see [MVP_BACKLOG.md](../../../MVP_BACKLOG.md)). This placeholder
exists so the module boundary is reserved from Sprint 0 — no logic lives here yet.
