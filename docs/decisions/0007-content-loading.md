# 0007 — Content files are the source of truth; the backend adopts Track B's contract

Status: accepted (2026-10-31)

## Context

Track B wrote `content/README.md` (shapes for directory, rights, journey, agencies, FAQ) and populated the files in parallel with the backend. Its shapes carried information the first domain model lacked (short codes vs full numbers, help topics, sensitive articles, related links, richer sources).

## Decision

- Model the files exactly as Track B specified, as Effect Schemas in `packages/domain/src/files/` (`ContentFiles.*`, snake_case like the files), and **map** them to domain entities in `@dadalink/content-loader` instead of asking Track B to change.
- Extend the domain where the files carry useful meaning: `DirectoryEntry.shortCode`, `helpsWith`, `city`, `telegram`, `languages`, kind `helpline`; `ContentItem.sensitive`, `related`, `updated`; `Source.publisher`, `accessed`; one shared `Topic` vocabulary (Track B `HelpTopic` + editorial topics). Migration `0003_track_b_fields`.
- The loader validates the whole tree and reports every issue with its file (schema errors, file-name rules, missing English source, cross-references) before anything is written; import goes through the `CatalogWriter` port and replaces the catalogue.
- Node imports in-process (`content seed`); D1 gets a generated SQL script (`content emit-sql`, built with the same Drizzle row mappers, replay-tested on SQLite) applied with `wrangler d1 execute --local --file`.
- The CLI uses `effect/cli` and lives in `apps/server-node` (a composition root), keeping the loader package free of database and platform code (`FileSystem`/`Path` are injected).

## Consequences

Track B's tree validates with zero errors and zero warnings. Not stored: `todo`, `name_status`, source `note`, FAQ `emergency` hint, agency-file guidance (kept in memory by the loader; candidate for a future `/agencies/guide` endpoint).
