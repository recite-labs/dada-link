import { Schema } from "effect"

/** Destination countries covered by the prototype (ISO 3166-1 alpha-2). */
export const DESTINATION_COUNTRIES = ["SA", "AE", "KW", "QA", "LB", "JO"] as const
/** Countries of origin (returnee services, agency checks). */
export const ORIGIN_COUNTRIES = ["ET"] as const
export const COUNTRIES = [...DESTINATION_COUNTRIES, ...ORIGIN_COUNTRIES] as const

export const DestinationCountry = Schema.Literals(DESTINATION_COUNTRIES).annotate({ identifier: "DestinationCountry" })
export type DestinationCountry = typeof DestinationCountry.Type

export const Country = Schema.Literals(COUNTRIES).annotate({
  identifier: "Country",
  description: "ISO 3166-1 alpha-2 code of a country covered by DadaLink"
})
export type Country = typeof Country.Type

/** Every covered country has a help directory with emergency numbers. */
export const EmergencyCapableCountry = Country

export const isDestinationCountry = Schema.is(DestinationCountry)
