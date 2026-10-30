# DadaLink Prototype — Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use `- [ ]`. TDD throughout: failing test → see it fail → minimal code → see it pass → commit (conventional commits). Spec: `docs/specs/2026-10-31-dadalink-design.md`.

**Goal:** A working DadaLink prototype for the UNICEF Femtech Ventures submission (deadline 11 Nov 2026): Effect backend deployable to Cloudflare or self-hosted, content, Telegram bot, React web app, native Android app.

**Architecture:** Hexagonal. `domain` (pure) ← `core` (use cases depending only on ports) ← `db` / `adapters` / `server` ← `apps` (composition roots). Each external dependency is a port (`Context.Service` tag); each deployment target provides a different set of Layers. One contract (`packages/api`, Effect `HttpApi`) shared by server and web; OpenAPI generated from it feeds the Android client.

**Tech stack (pin exact versions):** Node 24, pnpm 9, Turborepo 2, TypeScript (latest 6.x), Biome. `effect@4.1.x` (core includes `effect/http-api`, `effect/sql`, `effect/ai`, `effect/rpc`), `@effect/platform-node@4.1.x`, `@effect/sql-d1@4.1.x`, `@effect/sql-sqlite-node@4.1.x`, `@effect/ai-anthropic@4.1.x`, `@effect/vitest@4.1.x`, `drizzle-orm@1.0.0-rc.5` + `drizzle-kit@1.0.0-rc.5` (Effect drivers: `drizzle-orm/effect-d1`, `drizzle-orm/effect-sqlite-node`, `drizzle-orm/effect-schema`), wrangler 4. Web: React 19, Vite 8, TanStack Router + Query, Tailwind 4. Android: Kotlin 2.x, Jetpack Compose (BOM latest stable), Hilt, Room + SQLCipher, Ktor client, kotlinx.serialization, WorkManager, minSdk 24, applicationId `me.kibru.damakese`.

**Ground rules for agents**
- Effect v4 is new: read `node_modules/effect/AGENTS.md` and `node_modules/effect/ai-docs/src/**` before writing Effect code, and follow them (`Effect.gen`, `Effect.fn("name")`, `Schema`, `Layer`, `Context.Service`). Drizzle RC: read its README and `.d.ts` for `effect-d1` / `effect-sqlite-node` / `effect-schema` in node_modules. Never guess APIs from memory; check types.
- Dependency rule enforced by `dependency-cruiser` in CI: `domain` imports nothing internal; `core` imports `domain` + `ports` only; adapters never imported by `core`.
- Every port has an in-memory test layer and a shared contract test suite that every adapter runs.
- No secrets in the repo. Config via Effect `Config` (env). `.dev.vars` / `.env` are gitignored.
- Privacy: the server never stores users' names, phone numbers, logs, or assistant transcripts by default. SOS relay is transient.

---

## Track A — Backend (worktree branch `feat/backend`)

### File structure
```
package.json, pnpm-workspace.yaml, turbo.json, biome.json, tsconfig.base.json, .dependency-cruiser.cjs
packages/domain/src/      ids.ts, locale.ts, country.ts, journey.ts, content.ts, directory.ts, agency.ts,
                          assistant.ts, safety.ts, errors.ts, index.ts
packages/ports/src/       ContentRepo.ts, DirectoryRepo.ts, AgencyRepo.ts, Retriever.ts, SmsSender.ts,
                          MessengerBot.ts, RateLimiter.ts, index.ts   (LanguageModel comes from effect/ai)
packages/core/src/        content/ directory/ agencies/ assistant/ (prompt.ts, guardrails.ts, emergency.ts, Assistant.ts)
                          safety/ (SosRelay.ts) telegram/ (BotService.ts) index.ts
packages/db/              src/schema/*.ts (drizzle sqlite-core), src/repos/*.ts (Drizzle Effect implementations),
                          src/layers.ts (D1Live, SqliteNodeLive, MemoryLive), drizzle.config.ts, migrations/
packages/adapters/        ai-anthropic/ (baseUrl configurable → AI Gateway), sms/ (AfricasTalking, Twilio, LogOnly),
                          telegram/ (Bot API client), ratelimit/ (KV, memory)
packages/api/src/         groups: Health, Content, Directory, Agencies, Assistant, Safety, Telegram(webhook); Api.ts
packages/server/src/      handlers per group (HttpApiBuilder), ServerLive.ts
apps/server-cloudflare/   src/worker.ts, wrangler.jsonc
apps/server-node/         src/main.ts (NodeHttpServer + SQLite/libSQL + memory/redis layers), Dockerfile
```

### Tasks
- [ ] A1 Monorepo scaffold: workspace, turbo tasks (build/test/typecheck/lint), Biome, tsconfig strict + exactOptionalPropertyTypes, dependency-cruiser rules, GitHub Actions CI.
- [ ] A2 `domain`: Schemas + branded ids; Locale `am|om|en|sw|ti`; Country (SA, AE, KW, QA, LB, JO, ET); JourneyPhase `before|abroad|return`; tagged errors (NotFound, Validation, RateLimited, UpstreamUnavailable). Unit tests for decode/encode.
- [ ] A3 `db`: Drizzle sqlite schema (content items + translations, directory entries, agencies, assistant feedback (opt-in), rate limits); drizzle-kit RC migrations; Effect Schemas via `effect-schema`; repos implementing ports with `effect-sqlite-node` (in-memory for tests) and `effect-d1`. Port contract tests.
- [ ] A4 `core` Content + Directory + Agencies use cases (by country/phase/locale with fallback; agency lookup by name/licence, normalised). Tests with in-memory layers.
- [ ] A5 `api` + `server` for Health/Content/Directory/Agencies; `server-node` entry; e2e tests via HttpApiClient against an in-process server; emit `packages/api/openapi.json`.
- [ ] A6 Assistant: retrieval over content (SQLite FTS5 or BM25), system prompt (general information, not diagnosis or legal advice, answer in the user's language, cite sources), guardrails (emergency detector → leads with SOS + local emergency numbers), daily quota via RateLimiter keyed by pseudonymous device id, SSE streaming. LanguageModel = Anthropic via `@effect/ai-anthropic`, configurable base URL (AI Gateway) and model. Tests with a fake LanguageModel.
- [ ] A7 Safety: `POST /safety/sos` relays a message + location to the trusted contact via SmsSender (and Telegram if a chat id is given); nothing persisted; rate-limited. Tests with fake SmsSender.
- [ ] A8 Telegram: webhook (secret-token header verified), `/start`, menu buttons (Ask Dada, Help numbers, My rights, Get the app), free text → Assistant, via MessengerBot port. Tests with a fake bot client.
- [ ] A9 `server-cloudflare`: Worker entry composing D1 + KV rate limiter + AI Gateway config + secrets (`ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, SMS credentials) — no Cloudflare resources created by the agent. `wrangler dev --local` smoke test.
- [ ] A10 Content seeding: loader validating Track B files with domain Schemas, upserting into the DB (`effect/cli`), used by both server targets.
Done when: `pnpm test`, `pnpm typecheck`, `pnpm lint`, dependency-cruiser pass; server-node and wrangler dev serve all endpoints locally.

## Track B — Content (worktree branch `feat/content`)
Reviewable data files under `content/` (YAML front matter + Markdown), English source + Amharic and Afaan Oromo drafts marked `status: draft-ai` for human review. Shapes documented in `content/README.md`; validated by a small script now and by A10 later.
- [ ] B1 `content/directory/<country>.yaml`: Ethiopian embassy/consulates, labour hotlines, police/ambulance, IOM, shelters/NGOs for SA, AE, KW, QA, LB, JO + Ethiopian returnee services. Only publicly published numbers, each with `source_url` and `verified: false`; never invent numbers (use `phone: null` + TODO).
- [ ] B2 `content/rights/<country>.md`: contract, wages, hours/rest day, passport retention law, health insurance, ending a contract, complaint channels — with sources.
- [ ] B3 `content/journey/{before,abroad,return}/*.md`: ~8 articles per phase (licensed agencies vs illegal brokers, health prep incl. SRH/contraception, documents to copy, isolation and mental health, abuse: what to do, pregnancy abroad legal risks and options, returning home, claiming unpaid wages).
- [ ] B4 `content/agencies/ethiopia.yaml`: shape + how to obtain the MoLS licensed-agency list; only verifiable public entries (or empty + instructions).
- [ ] B5 `content/assistant/faq-seed.yaml`: 20 common questions with short grounded answers linking to articles.
Done when: all files validate; `content/SOURCES.md` lists every source.

## Track C — Android (worktree branch `feat/android`, folder `apps/android`)
Multi-module Gradle (Kotlin DSL, version catalog): `:app`, `:core:designsystem` (Paper "dadalink" tokens: ground #FFFFFF, surface #F5F4FA, line #E4E2EF, ink #17142B, muted #5E5A73, indigo #3B2F8F, deep #261D63, tint #ECEAF7, marigold #F2A93B, sos #D7263D, safe #2E7D5B; Inter + Noto Sans Ethiopic), `:core:model`, `:core:network` (Ktor; interface + fake until openapi.json exists), `:core:database` (Room + SQLCipher), `:core:security` (PIN, Keystore-wrapped DB key, quick exit), `:core:content` (offline bundle), `:feature:onboarding|home|assistant|help|sos|log|journey|health|disguise`.
- [ ] C1 Skeleton, version catalog, design system + typography, navigation, Hilt; theme tests; `assembleDebug` builds.
- [ ] C2 Onboarding + safe setup (language, PIN, disguise choice, trusted contact) in encrypted DataStore.
- [ ] C3 Home, Help directory (offline), SOS (hold 3 s; SmsManager to trusted contact + API relay when online), SOS sent.
- [ ] C4 Private log (Room + SQLCipher; wage, hours, incident + photo in app-private encrypted storage), export/share.
- [ ] C5 Ask Dada (streaming client behind an interface; fake until backend), quick exit, no notification previews, FLAG_SECURE on sensitive screens.
- [ ] C6 Disguise: calculator launcher alias; PIN + "=" opens the app.
Done when: `./gradlew test lint assembleDebug` pass; screens match the Paper designs.

## Track D — Web (after A5)
React 19 + Vite + TanStack Router/Query + Tailwind 4 in `apps/web`, typed client from `packages/api`, same tokens and screens as Android minus device-only features (log, disguise), plus content pages for families and partners. Served as static assets by the Cloudflare server or by server-node.
