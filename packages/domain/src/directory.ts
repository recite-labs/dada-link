import { Schema } from "effect"
import { HttpUrl, IsoDate, PhoneNumber, Text } from "./common.ts"
import { Country } from "./country.ts"
import { DirectoryEntryId } from "./ids.ts"
import type { Locale } from "./locale.ts"
import { LocalizedNamesOrEmpty } from "./localized.ts"

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
  /** `null` until a publicly published number has been found. Never invented. */
  phone: Schema.NullOr(PhoneNumber),
  whatsapp: Schema.optionalKey(PhoneNumber),
  email: Schema.optionalKey(Text(200)),
  url: Schema.optionalKey(HttpUrl),
  address: Schema.optionalKey(Text(500)),
  hours: Schema.optionalKey(Text(200)),
  notes: Schema.optionalKey(Text(1000)),
  /** True for numbers to call in an emergency (police, ambulance, hotline). */
  emergency: Schema.Boolean,
  sourceUrl: HttpUrl,
  verified: Schema.Boolean,
  lastVerified: Schema.optionalKey(IsoDate)
}) {}

export const displayName = (entry: DirectoryEntry, locale: Locale): string => entry.names[locale] ?? entry.name
