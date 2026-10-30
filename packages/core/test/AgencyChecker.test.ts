import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { AgencyChecker } from "../src/index.ts"
import { SeededCatalog } from "./seed.ts"

const TestLayer = AgencyChecker.layer.pipe(Layer.provideMerge(SeededCatalog))

describe("AgencyChecker", () => {
  it.effect("finds a licensed agency by licence number regardless of formatting", () =>
    Effect.gen(function* () {
      const result = yield* (yield* AgencyChecker).check("mols oea 001 2024")
      expect(result.verdict).toBe("licensed")
      expect(result.matches.map((a) => a.id)).toEqual(["et-agency-001"])
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect("finds an agency by name, ignoring case, punctuation and legal suffix", () =>
    Effect.gen(function* () {
      const result = yield* (yield* AgencyChecker).check("ABAY foreign employment agent p.l.c.")
      expect(result.verdict).toBe("revoked")
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect("reports not-found (never 'illegal') when nothing matches", () =>
    Effect.gen(function* () {
      const result = yield* (yield* AgencyChecker).check("Totally Unknown Brokers")
      expect(result.verdict).toBe("not-found")
      expect(result.matches).toEqual([])
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect("returns unknown when several agencies with different statuses match", () =>
    Effect.gen(function* () {
      const result = yield* (yield* AgencyChecker).check("employment")
      expect(result.matches.length).toBe(2)
      expect(result.verdict).toBe("unknown")
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect("rejects queries that are too short to be meaningful", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* AgencyChecker).check(" a. "))
      expect(error._tag).toBe("ValidationFailed")
    }).pipe(Effect.provide(TestLayer))
  )
})
