import type { UiLocale } from "./locales.ts"

/** Formats an ISO date (`YYYY-MM-DD`) for display; falls back to the raw value if the runtime lacks the locale. */
export const formatIsoDate = (iso: string, locale: UiLocale): string => {
  const date = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return iso
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(date)
  } catch {
    return iso
  }
}
