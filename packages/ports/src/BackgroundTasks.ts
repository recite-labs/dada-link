import { Context, type Effect } from "effect"

/**
 * Runs work after the HTTP response has been sent (Telegram webhook must be
 * acknowledged quickly). Node forks a fiber; Workers use `waitUntil`.
 */
export class BackgroundTasks extends Context.Service<
  BackgroundTasks,
  {
    run(task: Effect.Effect<void>): Effect.Effect<void>
  }
>()("@dadalink/ports/BackgroundTasks") {}
