import { BackgroundTasks } from "@dadalink/ports"
import { describe, expect, it } from "@effect/vitest"
import { Deferred, Effect, Ref } from "effect"
import { DetachedBackgroundTasks, InlineBackgroundTasks } from "../src/index.ts"

describe("BackgroundTasks", () => {
  it.effect("inline runs the task before returning", () =>
    Effect.gen(function* () {
      const ran = yield* Ref.make(false)
      yield* (yield* BackgroundTasks).run(Ref.set(ran, true))
      expect(yield* Ref.get(ran)).toBe(true)
    }).pipe(Effect.provide(InlineBackgroundTasks.layer))
  )

  it.effect("detached returns immediately and runs the task in the background, swallowing failures", () =>
    Effect.gen(function* () {
      const done = yield* Deferred.make<string>()
      const tasks = yield* BackgroundTasks
      yield* tasks.run(Effect.die("boom"))
      yield* tasks.run(Deferred.succeed(done, "ran").pipe(Effect.asVoid))
      expect(yield* Deferred.await(done)).toBe("ran")
    }).pipe(Effect.provide(DetachedBackgroundTasks.layer))
  )
})

describe("waitUntilBackgroundTasks", () => {
  it.effect("hands the task to the platform's waitUntil", () =>
    Effect.gen(function* () {
      const promises: Array<Promise<unknown>> = []
      const ran = yield* Ref.make(false)
      const { waitUntilBackgroundTasks } = yield* Effect.promise(() => import("../src/index.ts"))
      yield* waitUntilBackgroundTasks((p) => promises.push(p)).run(Ref.set(ran, true))
      expect(promises).toHaveLength(1)
      yield* Effect.promise(() => Promise.all(promises))
      expect(yield* Ref.get(ran)).toBe(true)
    })
  )
})
