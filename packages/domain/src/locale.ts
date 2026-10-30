import { Schema } from "effect"

/** Languages DadaLink speaks: Amharic, Afaan Oromo, English, Kiswahili, Tigrinya. */
export const LOCALES = ["am", "om", "en", "sw", "ti"] as const

export const Locale = Schema.Literals(LOCALES).annotate({
  identifier: "Locale",
  description: "BCP-47 primary language subtag supported by DadaLink"
})
export type Locale = typeof Locale.Type

/** Locale used when content or translations are missing for the requested one. */
export const FALLBACK_LOCALE: Locale = "en"
