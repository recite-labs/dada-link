import { COUNTRIES, type Country, JOURNEY_PHASES, type JourneyPhase } from "@dadalink/domain"
import { isUiLocale, type UiLocale } from "../i18n/locales.ts"
import { DEFAULT_SELECTION } from "./journey.ts"

/**
 * The only things DadaLink keeps in the browser: language, country, journey
 * step, and a random device id for the assistant's daily quota.
 */
export interface Preferences {
  readonly locale: UiLocale | undefined
  readonly country: Country
  readonly journey: JourneyPhase
}

const KEYS = {
  locale: "dadalink.locale",
  country: "dadalink.country",
  journey: "dadalink.journey",
  deviceId: "dadalink.deviceId"
} as const

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const isCountry = (value: unknown): value is Country =>
  typeof value === "string" && (COUNTRIES as ReadonlyArray<string>).includes(value)
const isJourney = (value: unknown): value is JourneyPhase =>
  typeof value === "string" && (JOURNEY_PHASES as ReadonlyArray<string>).includes(value)

export interface PreferenceStore {
  readonly get: () => Preferences
  readonly update: (patch: Partial<Omit<Preferences, "locale">> & { readonly locale?: UiLocale }) => void
  readonly subscribe: (listener: () => void) => () => void
  /** Random id created on first use; never linked to a person. */
  readonly deviceId: () => string
}

/**
 * Preferences backed by `localStorage`. Storage can be missing or throw
 * (private mode, quota): the app then works with defaults in memory.
 */
export const createPreferenceStore = (
  storage: Storage | undefined,
  randomUUID: () => string = () => crypto.randomUUID()
): PreferenceStore => {
  const memory = new Map<string, string>()
  const read = (key: string): string | null => {
    try {
      return storage?.getItem(key) ?? memory.get(key) ?? null
    } catch {
      return memory.get(key) ?? null
    }
  }
  const write = (key: string, value: string) => {
    memory.set(key, value)
    try {
      storage?.setItem(key, value)
    } catch {
      // Keep the in-memory value only.
    }
  }

  const load = (): Preferences => {
    const locale = read(KEYS.locale)
    const country = read(KEYS.country)
    const journey = read(KEYS.journey)
    return {
      locale: isUiLocale(locale) ? locale : undefined,
      country: isCountry(country) ? country : DEFAULT_SELECTION.country,
      journey: isJourney(journey) ? journey : DEFAULT_SELECTION.journey
    }
  }

  let snapshot = load()
  const listeners = new Set<() => void>()

  return {
    get: () => snapshot,
    update: (patch) => {
      if (patch.locale !== undefined) write(KEYS.locale, patch.locale)
      if (patch.country !== undefined) write(KEYS.country, patch.country)
      if (patch.journey !== undefined) write(KEYS.journey, patch.journey)
      const next = load()
      if (next.locale === snapshot.locale && next.country === snapshot.country && next.journey === snapshot.journey) {
        return
      }
      snapshot = next
      for (const listener of listeners) listener()
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    deviceId: () => {
      const existing = read(KEYS.deviceId)
      if (existing !== null && UUID.test(existing)) return existing
      const created = randomUUID()
      write(KEYS.deviceId, created)
      return created
    }
  }
}

/** `localStorage` when the browser allows it. */
export const browserStorage = (): Storage | undefined => {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage
  } catch {
    return undefined
  }
}
