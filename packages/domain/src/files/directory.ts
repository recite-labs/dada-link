import { Schema } from "effect"
import { HttpUrl, IsoDate, PhoneNumber, ShortCode, Text } from "../common.ts"
import { ReviewStatus } from "../content.ts"
import { Country } from "../country.ts"
import { DirectoryKind } from "../directory.ts"
import { DirectoryEntryId } from "../ids.ts"
import { Topic } from "../topic.ts"
import { FileSource, LocalizedText, Nullable, Todo } from "./common.ts"

/** One entry of `directory/<cc>.yaml`. */
export const DirectoryFileEntry = Schema.Struct({
  id: DirectoryEntryId,
  country: Country,
  kind: DirectoryKind,
  name: LocalizedText(300),
  name_status: Schema.optionalKey(ReviewStatus),
  helps_with: Schema.Array(Topic).check(Schema.isMinLength(1)),
  phone: Nullable(PhoneNumber),
  short_code: Nullable(ShortCode),
  whatsapp: Nullable(PhoneNumber),
  telegram: Nullable(Text(200)),
  email: Nullable(Text(200)),
  website: Nullable(HttpUrl),
  hours: Nullable(Text(200)),
  languages: Schema.optionalKey(Schema.Array(Text(40))),
  city: Nullable(Text(120)),
  address: Nullable(Text(500)),
  notes: Nullable(Text(1000)),
  source_url: HttpUrl,
  sources: Schema.optionalKey(Schema.Array(FileSource)),
  verified: Schema.Boolean,
  todo: Schema.optionalKey(Todo)
}).annotate({ identifier: "DirectoryFileEntry" })
export type DirectoryFileEntry = typeof DirectoryFileEntry.Type

/** `directory/<cc>.yaml`. */
export const DirectoryFile = Schema.Struct({
  country: Country,
  updated: Schema.optionalKey(IsoDate),
  entries: Schema.Array(DirectoryFileEntry)
}).annotate({ identifier: "DirectoryFile" })
export type DirectoryFile = typeof DirectoryFile.Type
