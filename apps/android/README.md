# DadaLink for Android

Native Kotlin/Compose app. Multi-module, clean architecture: features depend on `:core:domain`
interfaces only, and Hilt binds them to `:core:data` implementations. Features never depend on
each other.

```
app ─┬─ feature:* ──── core:domain ── core:model
     └─ core:data ─┬─ core:network   (Ktor client for packages/api)
                   ├─ core:database  (Room + SQLCipher: private log, synced content)
                   ├─ core:datastore (encrypted settings, device id)
                   └─ core:content   (bundled sample: first-launch fallback)
```

## Build

```sh
./gradlew test lint assembleDebug
```

| Gradle property | Default | Meaning |
|---|---|---|
| `dadalink.apiBaseUrl` | `https://dadalink.recitelabs.com` | API origin (same origin as the web app). |
| `dadalink.useFakeBackend` | `false` | `true` = in-process fakes: canned assistant, relay reports failure, bundled content only, no sync. |

Local server (`apps/server-node`) from the emulator:

```sh
./gradlew installDebug -Pdadalink.apiBaseUrl=http://10.0.2.2:3000
```

Cleartext HTTP is allowed only in debug builds and only to `10.0.2.2`, `localhost` and
`127.0.0.1` (`app/src/debug/res/xml/network_security_config.xml`). Release builds are HTTPS-only.

## API contract

`packages/api/openapi.json` is the source of truth. `:core:network` mirrors it by hand:

- One DTO per schema in `core/network/.../model`, named after it (`FooEncoded` → `FooDto`). The
  mapping rules for required, nullable and optional fields are in `model/WireContract.kt`.
- `OpenApiContractTest` reads `openapi.json` straight from the monorepo and fails on any drift:
  missing or extra fields, required-ness, nullability, stream event tags, routes, and the
  Locale/Country/JourneyPhase enums the app sends. When the backend changes, run the test and
  update the DTO it names.
- Endpoint tests run against fixtures captured from the live API
  (`core/network/src/test/resources/fixtures`, including one real assistant SSE stream).

We chose a hand-written mirror plus a contract test over a code generator. The spec is small, the
generated Kotlin for Effect's `anyOf`/`_tag` unions is poor, and the test catches every
divergence that matters.

The assistant stream (`POST /assistant/ask/stream`) sends bare `data:` lines holding
`AssistantStreamEvent` JSON in this order: `Emergency`? → `Citations` → `Delta`* → `Done`. A
failure arrives as the event `effect/http-api/stream/failure`. A 429 `RateLimited` maps to the quota
message.

## Privacy on the wire

- The only identifier sent is a random UUID created on first use and stored in the encrypted
  settings file. The server uses it only for per-device quotas.
- Ask Dada sends only the last question, plus locale, country and journey phase.
- The HTTP client has no logging and no cookies.

## Offline-first content

`ContentSyncWorker` (WorkManager, daily plus on demand, any network, exponential backoff) syncs the
help directory for the user's country and for Ethiopia (returnee services), then all reviewed content
for the user's language. Everything is stored in the encrypted database. Each scope is swapped
atomically, help numbers are synced first, and an empty response never wipes stored numbers.
`ContentSyncTrigger` starts an immediate sync on first run and whenever the stored copy for the
current country or language is missing or older than 12 hours.

`OfflineFirstContentRepository` reads the synced copy and falls back to the bundled sample until the
first sync succeeds, or whenever the database cannot be opened. Help numbers and SOS never wait for
the network.

## SOS

The app does not hold `SEND_SMS` (Play only allows it for default SMS apps and a few exceptions).
The server relay (`POST /safety/sos`) goes first; then the app opens the user's SMS app with the alert
filled in (`ACTION_SENDTO`, works without data) and the user presses send. The relay needs the contact's number in international format (`+251…`) or a numeric Telegram chat id. When the
phone is offline the relay is queued, encrypted, in WorkManager. If the server answers that it could
not deliver, the app does not retry.
