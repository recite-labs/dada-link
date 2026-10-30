import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { ContentRepo } from "@dadalink/ports"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { RepositoriesLive } from "../src/index.ts"
import { DatabaseNode } from "../src/node.ts"

describe("DatabaseNode", () => {
  it.effect("creates missing parent folders and migrates a new database file", () => {
    const root = mkdtempSync(join(tmpdir(), "dadalink-db-"))
    const filename = join(root, "nested", "folder", "dadalink.db")
    return Effect.gen(function* () {
      expect(yield* (yield* ContentRepo).list({})).toEqual([])
    }).pipe(
      Effect.provide(RepositoriesLive.pipe(Layer.provide(DatabaseNode.layer({ filename })), Layer.orDie)),
      Effect.ensuring(Effect.sync(() => rmSync(root, { recursive: true, force: true })))
    )
  })
})
