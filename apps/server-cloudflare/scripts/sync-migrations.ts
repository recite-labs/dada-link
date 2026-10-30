/**
 * Copies drizzle-kit migrations (packages/db/migrations/<timestamp>_<name>/migration.sql)
 * into the flat layout wrangler expects (migrations/0001_<name>.sql).
 * Run after `pnpm --filter @dadalink/db db:generate`.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const source = fileURLToPath(new URL("../../../packages/db/migrations", import.meta.url))
const target = fileURLToPath(new URL("../migrations", import.meta.url))

export const plannedMigrations = () =>
  readdirSync(source, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .toSorted()
    .map((dir, index) => ({
      file: `${String(index + 1).padStart(4, "0")}_${dir.replace(/^\d+_/, "")}.sql`,
      sql: `-- Generated from packages/db/migrations/${dir}/migration.sql by scripts/sync-migrations.ts. Do not edit.\n${readFileSync(join(source, dir, "migration.sql"), "utf8")}`
    }))

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const migration of plannedMigrations()) {
    writeFileSync(join(target, migration.file), migration.sql)
    process.stdout.write(`wrote migrations/${migration.file}\n`)
  }
}
