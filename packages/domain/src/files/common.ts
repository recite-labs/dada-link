import { Schema } from "effect"
import { HttpUrl, IsoDate, Text } from "../common.ts"

/**
 * File-format schemas for the reviewed content repository (`content/`),
 * mirroring Track B's contract in `content/README.md`. Field names follow the
 * files (snake_case). Loaders map them to domain entities.
 */

/** Optional in the file, and `null` allowed: "not known yet". */
export const Nullable = <S extends Schema.Top>(schema: S) => Schema.optionalKey(Schema.NullOr(schema))

export const FileSource = Schema.Struct({
  url: HttpUrl,
  title: Text(300),
  accessed: IsoDate,
  publisher: Schema.optionalKey(Text(300)),
  note: Schema.optionalKey(Text(1000))
}).annotate({ identifier: "FileSource" })
export type FileSource = typeof FileSource.Type

/** `Localized`: mapping of locale to text, English required. */
export const LocalizedText = (maxLength: number) =>
  Schema.Struct({
    en: Text(maxLength),
    am: Schema.optionalKey(Text(maxLength)),
    om: Schema.optionalKey(Text(maxLength)),
    sw: Schema.optionalKey(Text(maxLength)),
    ti: Schema.optionalKey(Text(maxLength))
  })

/** Open questions for reviewers; a string, a list, or null. */
export const Todo = Schema.Union([Schema.String, Schema.Array(Schema.String), Schema.Null])
