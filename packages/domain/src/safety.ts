import { Schema } from "effect"
import { E164PhoneNumber, Text } from "./common.ts"
import { Country } from "./country.ts"
import { DeviceId, TelegramChatId } from "./ids.ts"
import { Locale } from "./locale.ts"

export class GeoLocation extends Schema.Class<GeoLocation>("GeoLocation")({
  latitude: Schema.Finite.check(Schema.isBetween({ minimum: -90, maximum: 90 })),
  longitude: Schema.Finite.check(Schema.isBetween({ minimum: -180, maximum: 180 })),
  accuracyMeters: Schema.optionalKey(Schema.Finite.check(Schema.isGreaterThanOrEqualTo(0)))
}) {}

const hasChannel = Schema.makeFilter<{ readonly phone?: string; readonly telegramChatId?: number }>(
  (contact) =>
    contact.phone !== undefined ||
    contact.telegramChatId !== undefined ||
    "A trusted contact needs a phone number or a Telegram chat id"
)

export const TrustedContact = Schema.Struct({
  phone: Schema.optionalKey(E164PhoneNumber),
  telegramChatId: Schema.optionalKey(TelegramChatId)
})
  .check(hasChannel)
  .annotate({ identifier: "TrustedContact" })
export type TrustedContact = typeof TrustedContact.Type

export const MAX_SOS_MESSAGE_LENGTH = 500

export class SosRequest extends Schema.Class<SosRequest>("SosRequest")({
  deviceId: DeviceId,
  locale: Locale,
  country: Schema.optionalKey(Country),
  trustedContact: TrustedContact,
  message: Schema.optionalKey(Text(MAX_SOS_MESSAGE_LENGTH)),
  location: Schema.optionalKey(GeoLocation)
}) {}

export const SosChannel = Schema.Literals(["sms", "telegram"]).annotate({ identifier: "SosChannel" })
export type SosChannel = typeof SosChannel.Type

export class SosResult extends Schema.Class<SosResult>("SosResult")({
  deliveredVia: Schema.Array(SosChannel),
  failedVia: Schema.Array(SosChannel)
}) {}
