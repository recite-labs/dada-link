import {
  ContentId,
  ContentKind,
  ContentSummary,
  Country,
  JourneyPhase,
  Locale,
  LocalizedContent,
  Topic
} from "@dadalink/domain"
import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api"
import { NotFoundError } from "../errors.ts"

export class ContentApi extends HttpApiGroup.make("content")
  .add(
    HttpApiEndpoint.get("list", "/", {
      query: {
        locale: Schema.optionalKey(Locale),
        country: Schema.optionalKey(Country),
        phase: Schema.optionalKey(JourneyPhase),
        kind: Schema.optionalKey(ContentKind),
        topic: Schema.optionalKey(Topic)
      },
      success: Schema.Array(ContentSummary)
    }),
    HttpApiEndpoint.get("get", "/:id", {
      params: { id: ContentId },
      query: { locale: Schema.optionalKey(Locale) },
      success: LocalizedContent,
      error: NotFoundError
    })
  )
  .prefix("/content")
  .annotateMerge(
    OpenApi.annotations({
      title: "Content",
      description: "Reviewed articles, rights per country and FAQs, resolved to the requested locale (English fallback)"
    })
  ) {}
