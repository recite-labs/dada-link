import { Config, Context, Effect, Layer } from "effect"

/** Tunables of the assistant use case. */
export class AssistantSettings extends Context.Service<
  AssistantSettings,
  {
    /** Only answer from `reviewed` translations. */
    readonly reviewedOnly: boolean
    /** Questions per device per day. */
    readonly dailyLimit: number
    /** Passages given to the model. */
    readonly maxPassages: number
  }
>()("@dadalink/core/AssistantSettings") {
  static readonly layer = (settings: AssistantSettings["Service"]) => Layer.succeed(AssistantSettings, settings)

  /**
   * From the environment: `DADALINK_ASSISTANT_REVIEWED_ONLY` (default true),
   * `DADALINK_ASSISTANT_DAILY_LIMIT` (default 30), `DADALINK_ASSISTANT_MAX_PASSAGES` (default 4).
   */
  static readonly layerConfig = Layer.effect(
    AssistantSettings,
    Effect.gen(function* () {
      return yield* Config.all({
        reviewedOnly: Config.Boolean("DADALINK_ASSISTANT_REVIEWED_ONLY").pipe(Config.withDefault(true)),
        dailyLimit: Config.Int("DADALINK_ASSISTANT_DAILY_LIMIT").pipe(Config.withDefault(30)),
        maxPassages: Config.Int("DADALINK_ASSISTANT_MAX_PASSAGES").pipe(Config.withDefault(4))
      })
    })
  )
}
