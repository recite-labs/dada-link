# 0001 — Hexagonal architecture with Effect Layers

Status: accepted (2026-10-31)

## Context
DadaLink must run on Cloudflare (Workers + D1 + KV) and self-hosted (Node + SQLite) without forking business logic. The team is small; the code must stay easy to test and swap.

## Decision
- `packages/domain` holds pure Schemas, branded ids and tagged errors.
- `packages/ports` declares every external dependency as a `Context.Service` (ContentRepo, DirectoryRepo, AgencyRepo, CatalogWriter, Retriever, RateLimiter, SmsSender, MessengerBot, ChatPreferencesRepo, FeedbackRepo, BackgroundTasks). `LanguageModel` comes from `effect/ai`.
- `packages/core` contains use cases that depend only on domain + ports.
- Driven adapters (`packages/db`, `packages/adapters`, `packages/content-loader`) implement ports; `packages/api` is the HttpApi contract (domain only); `packages/server` implements the contract with core services.
- `apps/*` are composition roots: they choose Layers per deployment target.
- Every port has an in-memory implementation and a shared contract suite in `packages/testing` that every adapter runs.
- dependency-cruiser enforces the rules in CI (`.dependency-cruiser.cjs`).

Workspace packages are consumed as TypeScript source (`exports` → `src/*.ts`, `.ts` import specifiers, `erasableSyntaxOnly`), so there is no build step: Node 24 strips types natively and wrangler/esbuild bundles the Worker.

## Consequences
Swapping SQLite for D1, Africa's Talking for Twilio, or Anthropic for a fake model is a Layer change in one file. The price is some ceremony (ports + memory adapters + contract suites) for every new dependency.
