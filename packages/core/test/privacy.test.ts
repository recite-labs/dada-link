import { describe, expect, it } from "@effect/vitest"
import { Effect, Redacted } from "effect"
import { Pseudonymizer } from "../src/index.ts"

const run = <A, E>(salt: string, effect: Effect.Effect<A, E, Pseudonymizer>) =>
  Effect.provide(effect, Pseudonymizer.layer(Redacted.make(salt)))

describe("Pseudonymizer", () => {
  it.effect("produces a stable 64-hex SHA-256 digest", () =>
    run(
      "salt-a",
      Effect.gen(function* () {
        const p = yield* Pseudonymizer
        const a = yield* p.hash("device", "6f1c1d2e-8a3b-4c5d-9e6f-7a8b9c0d1e2f")
        expect(a).toMatch(/^[0-9a-f]{64}$/)
        expect(yield* p.hash("device", "6f1c1d2e-8a3b-4c5d-9e6f-7a8b9c0d1e2f")).toBe(a)
        expect(a).not.toContain("6f1c1d2e")
      })
    )
  )

  it.effect("separates namespaces and salts", () =>
    Effect.gen(function* () {
      const hash = (namespace: string) =>
        Effect.gen(function* () {
          return yield* (yield* Pseudonymizer).hash(namespace, "x")
        })
      const a = yield* run("salt-a", hash("device"))
      const b = yield* run("salt-a", hash("chat"))
      const c = yield* run("salt-b", hash("device"))
      expect(new Set([a, b, c]).size).toBe(3)
    })
  )
})
