import { readdirSync, readFileSync } from "node:fs"
import { describe, expect, it } from "@effect/vitest"
import { plannedMigrations } from "../scripts/sync-migrations.ts"

describe("D1 migrations", () => {
  it("are in sync with packages/db (run `pnpm --filter @dadalink/server-cloudflare db:sync-migrations`)", () => {
    const dir = new URL("../migrations/", import.meta.url)
    const committed = readdirSync(dir)
      .filter((f) => f.endsWith(".sql"))
      .toSorted()
    const planned = plannedMigrations()
    expect(committed).toEqual(planned.map((m) => m.file))
    for (const m of planned) expect(readFileSync(new URL(m.file, dir), "utf8")).toBe(m.sql)
  })
})
