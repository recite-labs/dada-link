import type { Country, JourneyPhase, Locale } from "@dadalink/domain"
import { queryOptions } from "@tanstack/react-query"
import { type ContentListQuery, type DadaLinkApi, isApiError } from "../api/index.ts"

const HOUR = 60 * 60 * 1000

/** Reviewed content changes rarely: cache generously, which also helps on slow connections. */
const CONTENT_STALE_TIME = HOUR

/** Content id of the rights page for a country (`rights-sa`). */
export const rightsContentId = (country: Country): string => `rights-${country.toLowerCase()}`

export const contentQueries = {
  list: (api: DadaLinkApi, query: ContentListQuery) =>
    queryOptions({
      queryKey: ["content", "list", query] as const,
      queryFn: ({ signal }) => api.content.list(query, { signal }),
      staleTime: CONTENT_STALE_TIME
    }),
  journey: (api: DadaLinkApi, phase: JourneyPhase, locale: Locale) =>
    contentQueries.list(api, { phase, locale, kind: "article" }),
  detail: (api: DadaLinkApi, id: string, locale: Locale) =>
    queryOptions({
      queryKey: ["content", "detail", id, locale] as const,
      queryFn: ({ signal }) => api.content.get(id, locale, { signal }),
      staleTime: CONTENT_STALE_TIME
    })
}

export const directoryQueries = {
  forCountry: (api: DadaLinkApi, country: Country) =>
    queryOptions({
      queryKey: ["directory", country] as const,
      queryFn: ({ signal }) => api.directory.forCountry(country, { signal }),
      staleTime: CONTENT_STALE_TIME
    }),
  emergency: (api: DadaLinkApi, country: Country, locale: Locale) =>
    queryOptions({
      queryKey: ["directory", country, "emergency", locale] as const,
      queryFn: ({ signal }) => api.directory.emergency(country, locale, { signal }),
      staleTime: CONTENT_STALE_TIME
    })
}

export const agencyQueries = {
  check: (api: DadaLinkApi, query: string) =>
    queryOptions({
      queryKey: ["agencies", "check", query] as const,
      queryFn: ({ signal }) => api.agencies.check(query, { signal }),
      staleTime: 5 * 60 * 1000
    })
}

/** Retry transient failures only; a 404 or a validation error will not change on retry. */
export const shouldRetry = (failureCount: number, error: unknown): boolean =>
  failureCount < 2 && isApiError(error) && (error.kind === "network" || error.kind === "unavailable")
