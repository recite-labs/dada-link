import { Effect, Schema } from "effect"
import { HttpUrl, IsoDate, Text } from "./common.ts"
import { Country } from "./country.ts"
import { ContentId } from "./ids.ts"
import { JourneyPhase } from "./journey.ts"
import { FALLBACK_LOCALE, Locale } from "./locale.ts"
import { Topic } from "./topic.ts"

export const CONTENT_KINDS = ["article", "rights", "faq"] as const
export const ContentKind = Schema.Literals(CONTENT_KINDS).annotate({ identifier: "ContentKind" })
export type ContentKind = typeof ContentKind.Type

/**
 * Editorial status of a translation.
 * - `draft-ai`: machine drafted, awaiting human review
 * - `draft`: written by a person, awaiting expert review
 * - `reviewed`: approved by a qualified reviewer
 */
export const REVIEW_STATUSES = ["draft-ai", "draft", "reviewed"] as const
export const ReviewStatus = Schema.Literals(REVIEW_STATUSES).annotate({ identifier: "ReviewStatus" })
export type ReviewStatus = typeof ReviewStatus.Type

export class Source extends Schema.Class<Source>("Source")({
  title: Text(300),
  url: HttpUrl,
  publisher: Schema.optionalKey(Text(300)),
  /** Date the source was last read. */
  accessed: Schema.optionalKey(IsoDate)
}) {}

export class ContentTranslation extends Schema.Class<ContentTranslation>("ContentTranslation")({
  locale: Locale,
  status: ReviewStatus,
  title: Text(200),
  summary: Text(600),
  /** Markdown body. */
  body: Text(40_000)
}) {}

const uniqueLocales = Schema.makeFilter<ReadonlyArray<ContentTranslation>>((translations) => {
  const seen = new Set(translations.map((t) => t.locale))
  return seen.size === translations.length || "Each translation locale may appear only once"
})

export class ContentItem extends Schema.Class<ContentItem>("ContentItem")({
  id: ContentId,
  kind: ContentKind,
  /** `null` when the item applies to every phase of the journey. */
  phase: Schema.NullOr(JourneyPhase),
  /** Countries the item applies to; empty means it applies everywhere. */
  countries: Schema.Array(Country),
  topics: Schema.Array(Topic),
  sources: Schema.Array(Source),
  translations: Schema.Array(ContentTranslation).check(Schema.isMinLength(1), uniqueLocales),
  /** Abuse, sexual violence, pregnancy, suicide: clients hide previews and add a content note. */
  sensitive: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** Other items worth reading next. */
  related: Schema.Array(ContentId).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  updated: Schema.optionalKey(IsoDate)
}) {}

/** List view of an item resolved to one locale. */
export class ContentSummary extends Schema.Class<ContentSummary>("ContentSummary")({
  id: ContentId,
  kind: ContentKind,
  phase: Schema.NullOr(JourneyPhase),
  countries: Schema.Array(Country),
  topics: Schema.Array(Topic),
  locale: Locale,
  status: ReviewStatus,
  title: Schema.String,
  summary: Schema.String,
  sensitive: Schema.Boolean
}) {}

/** Detail view of an item resolved to one locale. */
export class LocalizedContent extends Schema.Class<LocalizedContent>("LocalizedContent")({
  id: ContentId,
  kind: ContentKind,
  phase: Schema.NullOr(JourneyPhase),
  countries: Schema.Array(Country),
  topics: Schema.Array(Topic),
  sources: Schema.Array(Source),
  locale: Locale,
  requestedLocale: Locale,
  status: ReviewStatus,
  title: Schema.String,
  summary: Schema.String,
  body: Schema.String,
  availableLocales: Schema.Array(Locale),
  sensitive: Schema.Boolean,
  related: Schema.Array(ContentId)
}) {}

/** Requested locale, then English, then whatever exists first. */
export const pickTranslation = (item: ContentItem, locale: Locale): ContentTranslation | undefined =>
  item.translations.find((t) => t.locale === locale) ??
  item.translations.find((t) => t.locale === FALLBACK_LOCALE) ??
  item.translations[0]

/** True when the item is relevant for the given country (empty list = global). */
export const appliesToCountry = (item: Pick<ContentItem, "countries">, country: Country): boolean =>
  item.countries.length === 0 || item.countries.includes(country)

export const localize = (item: ContentItem, locale: Locale): LocalizedContent | undefined => {
  const t = pickTranslation(item, locale)
  if (t === undefined) return undefined
  return new LocalizedContent({
    id: item.id,
    kind: item.kind,
    phase: item.phase,
    countries: item.countries,
    topics: item.topics,
    sources: item.sources,
    locale: t.locale,
    requestedLocale: locale,
    status: t.status,
    title: t.title,
    summary: t.summary,
    body: t.body,
    availableLocales: item.translations.map((x) => x.locale),
    sensitive: item.sensitive,
    related: item.related
  })
}

export const summarize = (item: ContentItem, locale: Locale): ContentSummary | undefined => {
  const t = pickTranslation(item, locale)
  if (t === undefined) return undefined
  return new ContentSummary({
    id: item.id,
    kind: item.kind,
    phase: item.phase,
    countries: item.countries,
    topics: item.topics,
    locale: t.locale,
    status: t.status,
    title: t.title,
    summary: t.summary,
    sensitive: item.sensitive
  })
}
