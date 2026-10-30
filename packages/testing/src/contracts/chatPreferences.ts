import { ChatPreferencesRepo } from "@dadalink/ports"
import { describe, expect, it } from "@effect/vitest"
import { Effect, type Layer, Option } from "effect"

/** Behaviour every ChatPreferencesRepo must satisfy. */
export const chatPreferencesContract = (name: string, makeLayer: () => Layer.Layer<ChatPreferencesRepo, unknown>) => {
  const run = <A, E>(effect: Effect.Effect<A, E, ChatPreferencesRepo>) => Effect.provide(effect, makeLayer())

  describe(`${name}: ChatPreferencesRepo`, () => {
    it.effect("returns none for an unknown chat", () =>
      run(
        Effect.gen(function* () {
          expect(Option.isNone(yield* (yield* ChatPreferencesRepo).get("hash-1"))).toBe(true)
        })
      )
    )

    it.effect("stores and overwrites preferences", () =>
      run(
        Effect.gen(function* () {
          const repo = yield* ChatPreferencesRepo
          yield* repo.set("hash-1", { locale: "am" })
          expect(yield* repo.get("hash-1")).toEqual(Option.some({ locale: "am" }))
          yield* repo.set("hash-1", { locale: "om", country: "SA" })
          expect(yield* repo.get("hash-1")).toEqual(Option.some({ locale: "om", country: "SA" }))
        })
      )
    )
  })
}
