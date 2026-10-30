/**
 * Top-level path prefixes served by the API (see `packages/api`). The web app
 * shares the API's origin: the dev server proxies these prefixes, the Workers
 * config runs the Worker first for them, and the Node server routes them to the
 * API before falling back to the single-page app. A test keeps this list in
 * sync with the HttpApi contract.
 */
export const API_PATH_PREFIXES = [
  "/health",
  "/openapi.json",
  "/content",
  "/directory",
  "/agencies",
  "/assistant",
  "/safety",
  "/telegram"
] as const
