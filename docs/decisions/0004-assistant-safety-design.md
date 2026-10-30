# 0004 — Assistant: grounded answers, deterministic safety, no transcripts

Status: accepted (2026-10-31)

## Context

"Ask Dada" talks to women who may be in danger, in five languages, about health, rights and safety. Wrong or invented answers can hurt; so can a missing emergency pointer or a leaked identity.

## Decision

- **Grounding**: retrieval runs first (`Retriever`, see 0003). If nothing relevant is found the server returns a fixed, localised fallback and **does not call the model**. Otherwise the system prompt (`packages/core/src/assistant/prompt.ts`, pure and unit-tested) restricts the answer to numbered SOURCES, requires `[n]` citations and a "Sources:" line, the user's language, a sister-like voice, a "general information, not legal or medical advice" note, and treats sources/question as data, not instructions. Structured `citations` are always returned alongside the text.
- **Reviewed content only** by default: `DADALINK_ASSISTANT_REVIEWED_ONLY=true` restricts retrieval to `reviewed` translations. The committed development env sets it to `false` so drafts can be exercised locally.
- **Emergency detection is deterministic**, not left to the model: a multilingual phrase lexicon (`emergencyLexicon.ts`) detects violence, threat to life, suicidal thoughts and medical emergencies. When detected, the answer's **first line** is a fixed localised message pointing to SOS and the emergency numbers of the user's country, taken from the help directory (`HelpDirectory.emergencyContacts`). It is prepended by code, also on the fallback path, and sent first in the SSE stream (`Emergency` event).
- **Privacy**: no question/answer text is persisted or logged. Phone numbers, e-mails and ID-like numbers are redacted before the question is sent to the model. The device id is a client-generated UUID used only for the daily quota, keyed as `assistant:<sha256(salt:device:id)>` via `Pseudonymizer` (WebCrypto, works on Node and Workers). Feedback is opt-in and content-free.
- **Model**: `LanguageModel` from `effect/ai`; `@effect/ai-anthropic` adapter with `DADALINK_AI_MODEL` (default `claude-sonnet-5-5`), `DADALINK_AI_BASE_URL` (Cloudflare AI Gateway) and `ANTHROPIC_API_KEY` (Redacted); optional `DADALINK_AI_GATEWAY_TOKEN` sent as `cf-aig-authorization`. `DADALINK_AI_PROVIDER=fake` selects an offline deterministic model; tests never call the real API (the Anthropic adapter is tested with a capturing `HttpClient`).
- **Streaming**: `POST /assistant/ask/stream` uses `HttpApiSchema.StreamSse` (events: Emergency?, Citations, Delta*, Done). Quota and retrieval happen before the stream starts so they fail as normal HTTP errors (429).

## Findings while implementing

- `@effect/ai-anthropic@4.1.1` requests `.../v1/messages?beta=true`; with a base URL ending in `/anthropic` this matches the AI Gateway route.
- Request payloads must be `Schema.Struct`s (not `Schema.Class`) so typed clients can send plain objects.

## Consequences

Non-English fixed texts and lexicon entries are drafts and need native-speaker review (tracked in docs/content-format.md). Lexical emergency detection will have false positives; that is acceptable because the cost is one extra line pointing to help.
