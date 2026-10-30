import { SmsDeliveryFailed, SmsSender } from "@dadalink/ports"
import { Effect, Layer } from "effect"

/**
 * Placeholder so deployments can select `twilio` without code changes once implemented.
 * TODO: implement with the Twilio Messages API (POST /2010-04-01/Accounts/{sid}/Messages.json,
 * basic auth TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN, From = TWILIO_FROM) and run the SMS contract.
 */
export const TwilioSmsSender = {
  layer: Layer.succeed(
    SmsSender,
    SmsSender.of({
      provider: "twilio",
      send: () =>
        Effect.fail(new SmsDeliveryFailed({ provider: "twilio", reason: "Twilio adapter is not implemented yet" }))
    })
  )
}
