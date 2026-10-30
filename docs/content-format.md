# Content format (Track B → backend)

The backend loads the reviewed content repository (`content/`, Track B) with
`@dadalink/content-loader`. The file shapes below are the **contract**; they
mirror `content/README.md` on `feat/content` and are enforced by the Effect
Schemas in `packages/domain/src/files/*.ts` (`ContentFiles.*`).

Validated against the Track B tree on 2026-10-31: **no errors, no warnings**
(56 items / 168 translations, 81 directory entries in 7 countries, 0 agencies).

## Commands

```sh
# validate (prints every problem with its file)
pnpm --filter @dadalink/server-node content validate <path-to>/content

# self-hosted: import into the SQLite database (created + migrated if missing)
pnpm --filter @dadalink/server-node content seed <path-to>/content --db ./data/dadalink.db

# Cloudflare: write a seed script, then apply it to the local D1 database
pnpm --filter @dadalink/server-node content emit-sql <path-to>/content --out ../server-cloudflare/seed.sql
cd apps/server-cloudflare && pnpm exec wrangler d1 execute DB --local --file seed.sql
```

Relative paths are resolved from `apps/server-node` (pnpm runs scripts in the package folder); `pnpm content ...` at the repository root is a shortcut.

Seeding replaces the catalogue (content, directory per country present in the
files, agencies). The FTS5 search index follows automatically (triggers).

## Layout

| Path                                 | Schema                                            | Becomes                                                               |
| ------------------------------------ | ------------------------------------------------- | --------------------------------------------------------------------- |
| `directory/<cc>.yaml`                | `ContentFiles.DirectoryFile`                      | `DirectoryEntry[]` for country `<CC>`, in file order                  |
| `rights/<cc>.<locale>.md`            | `ContentFiles.RightsFrontMatter` + Markdown body  | one `ContentItem` (`kind: rights`) per id, one translation per locale |
| `journey/<phase>/<slug>.<locale>.md` | `ContentFiles.JourneyFrontMatter` + Markdown body | one `ContentItem` (`kind: article`) per slug                          |
| `agencies/<country>.yaml`            | `ContentFiles.AgencyFile`                         | `Agency[]` (+ user guidance kept in memory)                           |
| `assistant/faq-seed.yaml`            | `ContentFiles.FaqFile`                            | one `ContentItem` (`kind: faq`) per item                              |

Anything else (`README.md`, `SOURCES.md`, `scripts/`) is ignored. A `.md` or
`.yaml` file in a content folder that matches none of these names is an error.

## Shared value types

| Type                          | Rule                                                                                                                                                                                                                                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Locale`                      | `am` \| `om` \| `en` \| `sw` \| `ti`                                                                                                                                                                                                                                                                     |
| `Country`                     | `SA` \| `AE` \| `KW` \| `QA` \| `LB` \| `JO` \| `ET`                                                                                                                                                                                                                                                     |
| `Phase`                       | `before` \| `abroad` \| `return`                                                                                                                                                                                                                                                                         |
| `Status`                      | `draft-ai` \| `draft` \| `reviewed` (the assistant answers only from `reviewed` in production)                                                                                                                                                                                                           |
| ids                           | lower-case words joined by single dashes (`passport-taken`, `rights-sa`, `sa-police`, `faq-...`)                                                                                                                                                                                                         |
| `Date`                        | `YYYY-MM-DD` (YAML 1.2 core schema: dates stay strings)                                                                                                                                                                                                                                                  |
| `Url`                         | `http(s)://...`                                                                                                                                                                                                                                                                                          |
| phone                         | `+` and digits, spaces/dashes allowed (`+251111234567`)                                                                                                                                                                                                                                                  |
| `short_code`                  | 2–8 digits, quoted in YAML (`"999"`)                                                                                                                                                                                                                                                                     |
| `Source`                      | `url`, `title`, `accessed` required; `publisher`, `note` optional                                                                                                                                                                                                                                        |
| `Localized`                   | mapping `Locale → text`, `en` required                                                                                                                                                                                                                                                                   |
| topics (`tags`, `helps_with`) | `emergency`, `abuse`, `sexual-violence`, `wages`, `passport`, `documents`, `labour-complaint`, `shelter`, `repatriation`, `legal`, `health`, `mental-health`, `trafficking`, `detention`, `returnee-support`, `fire` (the backend also accepts `srh`, `rights`, `money`, `agencies`, `safety`, `return`) |

Fields documented as nullable may be omitted or `null`.

## Rules checked beyond the schemas

- Rights: file `rights/<cc>.<locale>.md` must have `country: <CC>`, `locale: <locale>`, `id: rights-<cc>`.
- Journey: folder = `phase`, file slug = `id`, suffix = `locale`.
- Every id needs an English file (`<id>.en.md`); it is the source of metadata
  (phase, countries, tags, sensitive, related, sources) and must list at least
  one source. Translations contribute `title`, `summary`, `status` and body.
- At most one file per id and locale; all files of an id share the same `type`.
- Directory: file name = `country`; every entry has the same `country` and an id
  starting with `<cc>-`; ids are unique across files; `helps_with` is non-empty.
- FAQ: `articles` must reference existing content ids (error). Other `related`
  links to unknown ids are warnings.
- The Markdown body must not be empty. Lengths: title ≤ 200, summary ≤ 600,
  body ≤ 40 000 characters.

## How files map to the domain

- **Rights** → `kind: rights`, `countries: [country]`, `phase: abroad` (or
  `null` for `ET`, which covers the whole journey), `topics: [rights, legal]`.
- **Journey** → `kind: article`, `phase`, `countries`, `topics = tags`,
  `sensitive` (default false), `related`.
- **FAQ** → `kind: faq`, `phase: null`, `title = question`, `body = answer`,
  `summary` = first sentence of the answer, `related = articles`, `topics = tags`,
  same `status` for every locale. The `emergency` flag is informative only:
  emergency handling is deterministic and lexical (ADR 0004).
- **Directory** → `name = name.en`, `names` = other locales, `shortCode = short_code`,
  `url = website`, `helpsWith = helps_with`; `emergency` is true for kinds
  `emergency`, `police`, `ambulance` (these numbers lead the assistant's
  emergency line). The number shown to users is `short_code ?? phone`.
  `todo`, `name_status` and extra `sources` are not stored.
- **Agencies** → `status = licence_status`, `region = city`. Only agencies
  published by an official source belong here; an empty list is valid (the
  agency check then answers `not-found`, never "illegal").
- Source `note` fields are not stored; `publisher` and `accessed` are.

## Assistant fixed texts (need native-speaker review)

Besides content files, a few short texts are compiled into the backend because
they must work without the model or a database. English is the source; the
`am`, `om`, `sw`, `ti` versions are drafts:

- `packages/core/src/assistant/messages.ts`: no-content fallback, emergency first line.
- `packages/core/src/assistant/emergencyLexicon.ts`: danger phrases per language.
- `packages/core/src/safety/sosMessage.ts`: the SOS text sent to the trusted contact.
- `packages/core/src/telegram/botTexts.ts`: Telegram bot menus and replies.
