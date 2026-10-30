# 0003 — Lexical retrieval with SQLite FTS5 (BM25 fallback in TypeScript)

Status: accepted (2026-10-31)

## Context
The assistant must answer only from reviewed content and cite it. Content is small (tens to hundreds of articles) and multilingual (Ethiopic and Latin scripts). We want no extra infrastructure (no vector DB, no embedding calls) and identical behaviour on D1 and node:sqlite.

## Decision
- A custom drizzle-kit migration creates `content_fts` (FTS5, `unicode61 remove_diacritics 2`) and triggers that keep it in sync with `content_translations`.
- Verified: FTS5 is compiled into Node 24's `node:sqlite` (tested with Ethiopic text) and is supported by Cloudflare D1 (exercised under `wrangler dev --local`).
- Queries are built from user text by extracting Unicode letter/digit runs, quoting every term (no FTS operator injection) and using prefix matching for terms of 3+ characters (cheap inflection handling for Amharic/Afaan Oromo). Terms are OR-ed and ranked with `bm25(content_fts, 5, 2, 1)` (title > summary > body).
- Search covers the user's locale plus English; one passage per item is kept, preferring the user's locale.
- `RetrieverBm25` (packages/adapters, in-memory) implements the same port in TypeScript. It backs tests and is the fallback if a target lacks FTS5. Both run the same `retrieverContract`.

## Consequences
Good-enough recall for a curated corpus, zero cost, deterministic tests. Semantic search (embeddings) can later be added as another `Retriever` adapter.
