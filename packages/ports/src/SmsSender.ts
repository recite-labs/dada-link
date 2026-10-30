import type { E164PhoneNumber } from "@dadalink/domain"
import { Context, type Effect, Schema } from "effect"

export class SmsDeliveryFailed extends Schema.TaggedError<SmsDeliveryFailed>()("SmsDeliveryFailed", {
  provider: Schema.String,
  reason: Schema.String
}) {}

export interface SmsMessage {
  readonly to: E164PhoneNumber
  readonly text: string
}

/** Outbound SMS gateway (Africa's Talking, Twilio, log-only in development). */
export class SmsSender extends Context.Service<
  SmsSender,
  {
    readonly provider: string
    send(message: SmsMessage): Effect.Effect<void, SmsDeliveryFailed>
  }
>()("@dadalink/ports/SmsSender") {}
