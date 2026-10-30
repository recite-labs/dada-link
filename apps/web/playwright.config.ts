import { defineConfig } from "@playwright/test"

/**
 * Smoke test against a running stack (no servers are started here):
 *   pnpm --filter @dadalink/server-node dev      # API + seeded SQLite, fake model
 *   pnpm --filter @dadalink/web dev              # http://localhost:5173 (proxies the API)
 *   pnpm --filter @dadalink/web e2e
 * Uses the system Chrome; set DADALINK_SHOTS_DIR to save screenshots.
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.DADALINK_WEB_URL ?? "http://localhost:5173",
    channel: "chrome",
    headless: true,
    trace: "off"
  },
  projects: [
    { name: "mobile", use: { viewport: { width: 500, height: 1110 }, isMobile: false, hasTouch: true } },
    { name: "desktop", use: { viewport: { width: 1280, height: 900 } } }
  ]
})
