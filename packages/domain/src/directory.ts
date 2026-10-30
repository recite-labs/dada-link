import { Effect, Schema } from "effect"
import { HttpUrl, IsoDate, PhoneNumber, ShortCode, Text } from "./common.ts"
import { Country } from "./country.ts"
import { DirectoryEntryId } from "./ids.ts"
import type { Locale } from "./locale.ts"
import { LocalizedNamesOrEmpty } from "./localized.ts"
import { Topic } from "./topic.ts"

export const DIRECTORY_KINDS = [
  "emergency",
  "police",
  "ambulance",
  "fire",
  "embassy",
  "consulate",
  "labour-ministry",
  "labour-hotline",
  "iom",
  "un-agency",
  "shelter",
  "ngo",
  "health",
  "mental-health",
  "legal-aid",
  "returnee-service",
  "helpline",
  "other"
] as const
export const DirectoryKind = Schema.Literals(DIRECTORY_KINDS).annotate({ identifier: "DirectoryKind" })
export type DirectoryKind = typeof DirectoryKind.Type

export class DirectoryEntry extends Schema.Class<DirectoryEntry>("DirectoryEntry")({
  id: DirectoryEntryId,
  country: Country,
  kind: DirectoryKind,
  name: Text(300),
  names: LocalizedNamesOrEmpty,
  /** Full number; `null` until a publicly published number has been found. Never invented. */
  phone: Schema.NullOr(PhoneNumber),
  /** Local number dialled as-is inside the country (`999`, `8001234`). */
  shortCode: Schema.NullOr(ShortCode).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  whatsapp: Schema.optionalKey(PhoneNumber),
  telegram: Schema.optionalKey(Text(200)),
  email: Schema.optionalKey(Text(200)),
  url: Schema.optionalKey(HttpUrl),
  city: Schema.optionalKey(Text(120)),
  address: Schema.optionalKey(Text(500)),
  hours: Schema.optionalKey(Text(200)),
  notes: Schema.optionalKey(Text(1000)),
  helpsWith: Schema.Array(Topic).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  /** Languages spoken (ISO 639-1 codes or names). */
  languages: Schema.Array(Text(40)).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  /** True for numbers to call in an emergency (police, ambulance, hotline). */
  emergency: Schema.Boolean,
  sourceUrl: HttpUrl,
  verified: Schema.Boolean,
  lastVerified: Schema.optionalKey(IsoDate)
}) {}

export const displayName = (entry: DirectoryEntry, locale: Locale): string => entry.names[locale] ?? entry.name

/** The number to show on a "call" button: the short code inside the country, else the full number. */
export const dialableNumber = (entry: Pick<DirectoryEntry, "phone" | "shortCode">): PhoneNumber | null =>
  entry.shortCode ?? entry.phone
