import { Config, Effect, Layer } from "effect"
import { AfricasTalkingSmsSenderLive } from "./AfricasTalkingSmsSender.ts"
import { LogOnlySmsSender } from "./LogOnlySmsSender.ts"
import { TwilioSmsSender } from "./TwilioSmsSender.ts"

export const SmsProvider = Config.Literals(["log", "africastalking", "twilio"], "DADALINK_SMS_PROVIDER").pipe(
  Config.withDefault("log")
)

/** Chooses the SMS gateway from `DADALINK_SMS_PROVIDER` (`log` by default). */
export const SmsSenderLive = Layer.unwrap(
  Effect.gen(function* () {
    const provider = yield* SmsProvider
    switch (provider) {
      case "africastalking":
        return AfricasTalkingSmsSenderLive
      case "twilio":
        return TwilioSmsSender.layer
      case "log":
        return LogOnlySmsSender.layer
    }
  })
)
