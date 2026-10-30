import type { D1Database, KVNamespace } from "@cloudflare/workers-types"

/** Bindings declared in wrangler.jsonc, plus string vars and secrets. */
export interface Env {
  readonly DB: D1Database
  readonly RATE_LIMITS?: KVNamespace
  readonly [variable: string]: unknown
}

/** Only string-valued bindings are configuration (vars and secrets). */
export const configRecord = (env: Env): Record<string, string> =>
  Object.fromEntries(Object.entries(env).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
