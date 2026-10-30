import { type Country, DESTINATION_COUNTRIES, type JourneyPhase } from "@dadalink/domain"

/** Where she is, or is going, at each step of the journey. Ethiopia is offered on the way home. */
export const countriesFor = (phase: JourneyPhase): ReadonlyArray<Country> =>
  phase === "return" ? ["ET", ...DESTINATION_COUNTRIES] : DESTINATION_COUNTRIES

export interface JourneySelection {
  readonly journey: JourneyPhase
  readonly country: Country
}

export const DEFAULT_SELECTION: JourneySelection = { journey: "abroad", country: "SA" }

/**
 * Switches the journey step and keeps the country meaningful: coming home
 * selects Ethiopia; leaving the return step moves off Ethiopia.
 */
export const selectJourney = (current: JourneySelection, journey: JourneyPhase): JourneySelection => {
  if (journey === current.journey) return current
  if (journey === "return") return { journey, country: "ET" }
  return { journey, country: countriesFor(journey).includes(current.country) ? current.country : "SA" }
}
