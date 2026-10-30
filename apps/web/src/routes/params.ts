import { COUNTRIES, type Country, JOURNEY_PHASES, type JourneyPhase } from "@dadalink/domain"
import { isUiLocale, type UiLocale } from "../i18n/index.ts"

/** Route param parsers: returning `false` makes the route not match, so unknown values become 404s. */
export const parseLocaleParam = ({ locale }: { locale: string }): { locale: UiLocale } | false =>
  isUiLocale(locale) ? { locale } : false

export const parseCountryParam = ({ country }: { country: string }): { country: Country } | false => {
  const upper = country.toUpperCase()
  return (COUNTRIES as ReadonlyArray<string>).includes(upper) ? { country: upper as Country } : false
}

export const parsePhaseParam = ({ phase }: { phase: string }): { phase: JourneyPhase } | false =>
  (JOURNEY_PHASES as ReadonlyArray<string>).includes(phase) ? { phase: phase as JourneyPhase } : false
