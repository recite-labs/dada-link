import { Config, Context, Effect, Layer } from "effect"

export const DEFAULT_APP_URL = "https://play.google.com/store/apps/details?id=me.kibru.damakese"

export class BotSettings extends Context.Service<
  BotSettings,
  {
    /** Where "Get the app" points. */
    readonly appUrl: string
  }
>()("@dadalink/core/BotSettings") {
  static readonly layer = (settings: BotSettings["Service"]) => Layer.succeed(BotSettings, settings)

  /** `DADALINK_APP_URL` (defaults to the Play Store listing). */
  static readonly layerConfig = Layer.effect(
    BotSettings,
    Effect.gen(function* () {
      return { appUrl: yield* Config.String("DADALINK_APP_URL").pipe(Config.withDefault(DEFAULT_APP_URL)) }
    })
  )
}
