import { BackgroundTasks } from "@dadalink/ports"
import { Effect, Layer } from "effect"

const logFailures = (task: Effect.Effect<void>) =>
  task.pipe(Effect.catchCause((cause) => Effect.logError("Background task failed", cause)))

/** Long-running processes (Node): fork a detached fiber and return immediately. */
export const DetachedBackgroundTasks = {
  layer: Layer.succeed(
    BackgroundTasks,
    BackgroundTasks.of({ run: (task) => Effect.forkDetach(logFailures(task)).pipe(Effect.asVoid) })
  )
}

/** Tests and simple setups: run the task before returning. */
export const InlineBackgroundTasks = {
  layer: Layer.succeed(BackgroundTasks, BackgroundTasks.of({ run: logFailures }))
}

/**
 * Serverless runtimes: hand the task to the platform (e.g. Workers `ctx.waitUntil`)
 * so it may finish after the response has been sent.
 */
export const waitUntilBackgroundTasks = (waitUntil: (promise: Promise<unknown>) => void) =>
  BackgroundTasks.of({
    run: (task) =>
      Effect.flatMap(Effect.context<never>(), (context) =>
        Effect.sync(() => waitUntil(Effect.runPromiseWith(context)(logFailures(task))))
      )
  })
