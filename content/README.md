# DadaLink content

Reviewable data for DadaLink: help directory, rights per country, journey articles,
licensed-agency data and assistant FAQ seed. English is the source language.
Amharic (`am`) and Afaan Oromo (`om`) files are machine-drafted (`status: draft-ai`)
and must be reviewed by native speakers before launch.

**Nothing here is verified yet.** Every entry carries `verified: false`. A human must
check each phone number, address and legal statement against its source (and ideally
by calling the number) before setting `verified: true`.

Validate everything with:

```sh
node content/scripts/validate.mjs            # validate all files
node content/scripts/validate.mjs --sources  # also regenerate content/SOURCES.md
```

The script has no dependencies. It reads a **restricted YAML subset** (see the end of
this file), so keep files inside that subset.

## Layout

```
content/
  README.md                     this file (the contract)
  SOURCES.md                    generated list of every source URL
  directory/{sa,ae,kw,qa,lb,jo,et}.yaml   B1 help directory per country
  rights/{sa,ae,kw,qa,lb,jo,et}.{en,am,om}.md   B2 rights per country
  journey/{before,abroad,return}/<slug>.{en,am,om}.md   B3 journey articles
  agencies/ethiopia.yaml        B4 licensed private employment agencies (Ethiopia)
  assistant/faq-seed.yaml       B5 seed questions + grounded answers
  scripts/validate.mjs          validator
```

## Shared types

| Type | Values |
|---|---|
| `Locale` | `am` \| `om` \| `en` \| `sw` \| `ti` |
| `Country` | `SA` (Saudi Arabia) \| `AE` (UAE) \| `KW` (Kuwait) \| `QA` (Qatar) \| `LB` (Lebanon) \| `JO` (Jordan) \| `ET` (Ethiopia) |
| `Phase` | `before` \| `abroad` \| `return` |
| `Status` | `draft-ai` (machine-written, needs human review) \| `reviewed` |
| `Date` | `YYYY-MM-DD` |
| `Url` | string starting with `https://` or `http://` |
| `E164` | `+` followed by 7 to 15 digits, no spaces (e.g. `+251111234567`) |
| `ShortCode` | 2 to 8 digits, a local number dialled as-is inside the country: emergency codes and local toll-free lines (e.g. `911`, `999`, `8007283`) |
| `Source` | mapping: `url: Url` (required), `title: string` (required), `accessed: Date` (required), `publisher: string` (optional), `note: string` (optional) |
| `Localized` | mapping of `Locale` to string. `en` required. |

Rules that apply everywhere:

- Never invent phone numbers, addresses, laws, amounts or licence numbers. If you could
  not find it in a source, use `null` and explain in `todo`.
- `verified` is always `false` until a human checks it.
- Every factual claim must be traceable to an item in `sources` (or `source_url`).
- Access dates for the first research pass are `2026-10-31`.

## B1 Directory — `directory/<cc>.yaml`

```yaml
country: SA                 # Country, must match the file name
updated: 2026-10-31         # Date
entries:                    # list of DirectoryEntry
  - id: sa-police           # string, kebab-case, unique across all files, starts with "<cc>-"
    country: SA             # Country, same as file
    kind: police            # DirectoryKind (below)
    name:                   # Localized; en required; am/om drafts
      en: Police
      am: ፖሊስ
      om: Poolisii
    name_status: draft-ai   # Status of the am/om names
    helps_with: [emergency, abuse]   # list of HelpTopic (below), at least one
    phone: null             # E164 or null
    short_code: "999"       # ShortCode (quoted) or null
    whatsapp: null          # E164 or null (only if publicly published)
    telegram: null          # "@handle" or https://t.me/... or null (only if public)
    email: null             # string or null
    website: null           # Url or null
    hours: "24/7"           # string or null
    languages: [ar, en]     # list of ISO 639-1 codes or language names; may be empty
    city: Riyadh            # string or null
    address: null           # string or null
    notes: null             # string or null: short, plain-English tip for the user
    source_url: https://... # Url (required): where the number/contact was found
    sources: []             # optional extra Source items
    verified: false         # bool
    todo: null              # string or null: what a human must still check
```

`DirectoryKind`: `emergency` | `embassy` | `consulate` | `labour-hotline` | `police` |
`ambulance` | `iom` | `shelter` | `ngo` | `returnee-service` | `helpline`.

`HelpTopic`: `emergency` | `abuse` | `sexual-violence` | `wages` | `passport` |
`documents` | `labour-complaint` | `shelter` | `repatriation` | `legal` | `health` |
`mental-health` | `trafficking` | `detention` | `returnee-support` | `fire`.

An entry must have at least one way to reach it (`phone`, `short_code`, `whatsapp`,
`telegram`, `email` or `website`) **or** a non-empty `todo`.

## B2 Rights — `rights/<cc>.<locale>.md`

Markdown with YAML front matter:

```yaml
---
id: rights-sa               # "rights-<cc>", same in every locale
type: rights
country: SA                 # Country
locale: en                  # Locale; must match the file name
title: Your rights as a domestic worker in Saudi Arabia
summary: One or two plain sentences.
status: draft-ai            # Status
verified: false
translation_of: null        # null for en; "rights-sa" for am/om
updated: 2026-10-31
sources:                    # list of Source, at least one (en files)
  - url: https://...
    title: ...
    accessed: 2026-10-31
todo: []                    # list of strings: open questions for reviewers
---
```

Body sections (English, `##` headings, in this order where the facts exist): Your
contract · Your pay · Working hours and rest · Your passport · Health care · Leave,
ending your contract and changing employer · Where to complain · Emergency numbers.
Only state wage amounts if an official source publishes them. Each section ends with
a source reference like `[1]` that matches the order of `sources`.

## B3 Journey — `journey/<phase>/<slug>.<locale>.md`

```yaml
---
id: passport-taken          # slug; equals the file name without ".<locale>.md"
type: journey
phase: abroad               # Phase; must match the folder
locale: en                  # Locale; must match the file name
title: My employer took my passport
summary: One or two plain sentences.
countries: [SA, AE, KW, QA, LB, JO]   # Countries it applies to (ET for home-side)
tags: [passport, documents] # list of HelpTopic
sensitive: false            # true for sexual violence, pregnancy, suicide, abuse
status: draft-ai
verified: false
translation_of: null        # null for en; the slug for am/om
related: [contacting-your-embassy]   # other journey slugs or rights-<cc> ids
updated: 2026-10-31
sources:
  - url: https://...
    title: ...
    accessed: 2026-10-31
todo: []
---
```

Writing style: plain, warm English, short sentences, reading age about 12. Never blame
the reader. Give practical steps ("What you can do"). Mention SOS and the help
directory where relevant. Sensitive topics are never graphic and always end with where
to get help.

Slugs (English file must exist for every am/om file):

- `before`: `licensed-agencies-vs-brokers`, `your-contract`, `documents-to-copy`,
  `health-preparation`, `contraception-and-srh-before-you-go`, `legal-risks-abroad`,
  `trusted-contact-and-safety-plan`, `money-fees-and-debt`
- `abroad`: `passport-taken`, `unpaid-wages`, `rest-and-working-hours`,
  `sick-or-injured`, `abuse-what-to-do`, `sexual-violence-what-to-do`,
  `pregnancy-abroad`, `loneliness-and-mental-health`, `leaving-a-bad-employer`,
  `contacting-your-embassy`
- `return`: `preparing-to-return`, `arriving-home`, `claiming-unpaid-wages-after-return`,
  `mental-health-after-return`, `health-check-after-return`,
  `family-and-community-after-return`, `money-and-work-after-return`,
  `detention-and-deportation`

## B4 Agencies — `agencies/ethiopia.yaml`

```yaml
country: ET
authority:
  name: Ministry of Labour and Skills (MoLS)
  website: https://...      # Url or null
how_to_obtain: |            # plain text: the method to get / refresh the official list
  ...
how_to_check_for_users: |   # plain text shown to users
  ...
last_checked: 2026-10-31
sources: [ ... ]            # list of Source
todo: []                    # list of strings
agencies:                   # list of Agency; may be empty
  - id: et-agency-<slug>    # kebab-case, unique
    name: ...               # official registered name
    licence_number: null    # string or null; never invented
    licence_status: licensed   # licensed | suspended | revoked | unknown
    city: null
    address: null
    phone: null             # E164 or null
    source_url: https://... # Url (required): official public source
    verified: false
    todo: null
```

## B5 FAQ seed — `assistant/faq-seed.yaml`

```yaml
updated: 2026-10-31
items:
  - id: faq-passport-taken  # kebab-case, starts with "faq-", unique
    question:               # Localized; en, am, om
      en: ...
    answer:                 # Localized; en, am, om. Short (under ~120 words), grounded
      en: ...
    status: draft-ai        # Status of the am/om text
    tags: [passport]        # list of HelpTopic
    countries: []           # list of Country; empty = all
    emergency: false        # true if the assistant should lead with SOS / emergency numbers
    articles: [passport-taken]   # journey slugs or rights-<cc> ids; must exist
    sources: [ ... ]        # list of Source (may be empty if fully covered by articles)
    verified: false
```

## Restricted YAML subset

The validator parses this subset only:

- Block mappings (`key: value`) and block sequences (`- item`), indented with spaces
  (no tabs). A sequence item may itself be a mapping (`- key: value` with following
  keys aligned under the first key).
- Scalars: plain, `'single'` or `"double"` quoted (double supports `\"`, `\\`, `\n`),
  `null`/`~`, `true`/`false`, integers. Dates stay strings.
- Flow sequences of scalars on one line: `[a, b, "c d"]` and `[]`. Empty mapping `{}`.
- Block scalars `|` and `>` (with optional `-`).
- Comments start with ` #` (a space then `#`) or at the start of a line. Quote any
  value that contains `: `, ` #`, or starts with a special character (`[ { > | * & ! % @ \``).
- No anchors, aliases, tags, multi-document streams, or multi-line flow collections.
