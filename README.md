# DadaLink

**A sister in your pocket — before you go, while you're away, when you come home.**

DadaLink is an open-source, safety-first companion for African women who migrate to the Gulf and Lebanon as domestic workers. It speaks their languages (Amharic, Afaan Oromo and English first; Kiswahili and Tigrinya next) through a Telegram bot and an Android app.

- **Before leaving:** check whether a recruitment agency is licensed, understand your contract and rights for your destination, prepare your health, set up a trusted contact.
- **Abroad:** ask _Dada_, an AI assistant that answers only from reviewed content (health, sexual and reproductive health, mental health, rights); find help numbers per country, offline; send an SOS with your location to someone you trust; keep a private, encrypted log of wages, hours and incidents.
- **Coming home:** mental-health check-ins, returnee services, help claiming unpaid wages.

## Safety by design

An employer may look at her phone. DadaLink can look like a calculator, has a one-tap _Hide_, a PIN and no notification previews, and keeps personal logs on the device only. The server stores as little as possible.

## Status

New project by [Recite Labs](https://recitelabs.com), Addis Ababa. Early development; see [`docs/specs`](docs/specs) for the product design.

## Development

Requires Node 24 and pnpm 9.

```sh
pnpm install
pnpm check                      # typecheck, lint (Biome), test, dependency rules
pnpm content seed <content-dir> # load reviewed content into apps/server-node/data/dadalink.db
pnpm --filter @dadalink/server-node dev   # http://localhost:3000 (offline: fake model, log-only SMS/Telegram)
cd apps/server-cloudflare && cp .dev.vars.example .dev.vars && pnpm db:migrate:local && pnpm dev   # Workers, local D1
```

## Web app

`apps/web` is a React 19 + Vite 8 + TanStack Router/Query + Tailwind 4 app in Amharic (default), Afaan Oromo and English (`/am`, `/om`, `/en`; the Amharic and Oromo UI texts are drafts awaiting native review). It talks to the API only through a typed client derived from `packages/api` (Effect `HttpApiClient`, confined to `apps/web/src/api`). There is no analytics, every request stays on the app's own origin (enforced by a Content-Security-Policy), and the browser keeps only language, country, journey step and a random device id for the assistant's daily quota.

```sh
pnpm --filter @dadalink/server-node dev   # API on :3000 (seed content first, see above)
pnpm --filter @dadalink/web dev           # http://localhost:5173, proxies API paths to :3000
pnpm --filter @dadalink/web build         # static build in apps/web/dist
pnpm --filter @dadalink/web e2e           # Playwright smoke test on system Chrome against the running dev stack
```

The web app and the API share one origin. API paths (`/health`, `/openapi.json`, `/content`, `/directory`, `/agencies`, `/assistant`, `/safety`, `/telegram`) never collide with app pages, which all start with a locale. The production build can be served two ways:

- **Cloudflare Workers**: `apps/server-cloudflare/wrangler.jsonc` serves `../web/dist` as static assets with single-page-app fallback, and `run_worker_first` sends API paths to the Worker. Build the web app before `pnpm dev` or a deploy. `public/_headers` sets immutable caching for hashed assets and security headers.
- **Node (self-hosted)**: set `DADALINK_WEB_DIR=../web/dist` (it is already set in `.env.development`). `apps/server-node` then serves the build with `HttpStaticServer`: immutable `/assets`, a `no-cache` shell, and `index.html` fallback for client routes. API routes keep precedence. Without the variable the server is API-only.

API contract: `packages/api` (OpenAPI in `packages/api/openapi.json`, served at `/openapi.json`). Architecture decisions: [`docs/decisions`](docs/decisions). Content file format: [`docs/content-format.md`](docs/content-format.md).

## License

[GNU AGPL-3.0](LICENSE). If you run a modified version as a service, you must share your changes.
