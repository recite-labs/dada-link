import { Schema } from "effect"
import { IsoDate } from "../common.ts"
import { ReviewStatus } from "../content.ts"
import { Country } from "../country.ts"
import { ContentId } from "../ids.ts"
import { Topic } from "../topic.ts"
import { FileSource, LocalizedText } from "./common.ts"

/** One item of `assistant/faq-seed.yaml`. */
export const FaqFileItem = Schema.Struct({
  id: ContentId.check(Schema.isStartingWith("faq-")),
  question: LocalizedText(500),
  answer: LocalizedText(4000),
  status: ReviewStatus,
  tags: Schema.Array(Topic),
  countries: Schema.Array(Country),
  /** Hint that the assistant should lead with SOS (detection itself is lexical; see ADR 0004). */
  emergency: Schema.optionalKey(Schema.Boolean),
  articles: Schema.Array(ContentId),
  sources: Schema.optionalKey(Schema.Array(FileSource)),
  verified: Schema.Boolean
}).annotate({ identifier: "FaqFileItem" })
export type FaqFileItem = typeof FaqFileItem.Type

/** `assistant/faq-seed.yaml`. */
export const FaqFile = Schema.Struct({
  updated: Schema.optionalKey(IsoDate),
  items: Schema.Array(FaqFileItem)
}).annotate({ identifier: "FaqFile" })
export type FaqFile = typeof FaqFile.Type
