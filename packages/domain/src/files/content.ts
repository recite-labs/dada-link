import { Schema } from "effect"
import { IsoDate, Text } from "../common.ts"
import { ReviewStatus } from "../content.ts"
import { Country } from "../country.ts"
import { ContentId } from "../ids.ts"
import { JourneyPhase } from "../journey.ts"
import { Locale } from "../locale.ts"
import { Topic } from "../topic.ts"
import { FileSource, Nullable, Todo } from "./common.ts"

const sharedFrontMatter = {
  id: ContentId,
  locale: Locale,
  title: Text(200),
  summary: Text(600),
  status: ReviewStatus,
  verified: Schema.Boolean,
  translation_of: Nullable(ContentId),
  updated: Schema.optionalKey(IsoDate),
  /** Required on English files, optional on translations. */
  sources: Schema.optionalKey(Schema.Array(FileSource)),
  todo: Schema.optionalKey(Todo)
}

/** Front matter of `rights/<cc>.<locale>.md`. */
export const RightsFrontMatter = Schema.Struct({
  ...sharedFrontMatter,
  type: Schema.Literal("rights"),
  country: Country
}).annotate({ identifier: "RightsFrontMatter" })
export type RightsFrontMatter = typeof RightsFrontMatter.Type

/** Front matter of `journey/<phase>/<slug>.<locale>.md`. */
export const JourneyFrontMatter = Schema.Struct({
  ...sharedFrontMatter,
  type: Schema.Literal("journey"),
  phase: JourneyPhase,
  countries: Schema.Array(Country),
  tags: Schema.optionalKey(Schema.Array(Topic)),
  sensitive: Schema.optionalKey(Schema.Boolean),
  related: Schema.optionalKey(Schema.Array(ContentId))
}).annotate({ identifier: "JourneyFrontMatter" })
export type JourneyFrontMatter = typeof JourneyFrontMatter.Type

export const ContentFrontMatter = Schema.Union([RightsFrontMatter, JourneyFrontMatter]).annotate({
  identifier: "ContentFrontMatter"
})
export type ContentFrontMatter = typeof ContentFrontMatter.Type
