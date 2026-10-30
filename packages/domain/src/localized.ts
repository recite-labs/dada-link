import { Effect, Schema } from "effect"

const Name = Schema.Trim.check(Schema.isNonEmpty(), Schema.isMaxLength(300))

/** Optional per-locale variants of a short text (e.g. an organisation name). */
export const LocalizedNames = Schema.Struct({
  am: Schema.optionalKey(Name),
  om: Schema.optionalKey(Name),
  en: Schema.optionalKey(Name),
  sw: Schema.optionalKey(Name),
  ti: Schema.optionalKey(Name)
}).annotate({ identifier: "LocalizedNames" })
export type LocalizedNames = typeof LocalizedNames.Type

/** `LocalizedNames` that defaults to `{}` when the key is missing. */
export const LocalizedNamesOrEmpty = LocalizedNames.pipe(Schema.withDecodingDefaultKey(Effect.succeed({})))
