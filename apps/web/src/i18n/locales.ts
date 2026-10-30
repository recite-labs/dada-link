import type { Locale } from "@dadalink/domain"

/** Languages the web UI ships today (Kiswahili and Tigrinya follow). */
export const UI_LOCALES = ["am", "om", "en"] as const satisfies ReadonlyArray<Locale>
export type UiLocale = (typeof UI_LOCALES)[number]

/** Amharic first: most users are Ethiopian. */
export const DEFAULT_LOCALE: UiLocale = "am"

export const isUiLocale = (value: unknown): value is UiLocale =>
  typeof value === "string" && (UI_LOCALES as ReadonlyArray<string>).includes(value)

/**
 * Picks the first supported language from the browser's preferences
 * (`navigator.languages`), falling back to Amharic.
 */
export const negotiateLocale = (preferred: ReadonlyArray<string>): UiLocale => {
  for (const tag of preferred) {
    const primary = tag.toLowerCase().split("-")[0]
    if (isUiLocale(primary)) return primary
  }
  return DEFAULT_LOCALE
}
