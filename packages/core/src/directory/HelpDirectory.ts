import type { Country, DirectoryEntry, Locale } from "@dadalink/domain"
import { dialableNumber, displayName, EmergencyContact } from "@dadalink/domain"
import { DirectoryRepo, type PersistenceError } from "@dadalink/ports"
import { Context, Effect, Layer } from "effect"

/** Pure: emergency entries with a dialable number, in curated order. */
export const toEmergencyContacts = (
  entries: ReadonlyArray<DirectoryEntry>,
  locale: Locale
): ReadonlyArray<EmergencyContact> =>
  entries.flatMap((entry) => {
    const phone = dialableNumber(entry)
    return entry.emergency && phone !== null
      ? [new EmergencyContact({ name: displayName(entry, locale), kind: entry.kind, phone })]
      : []
  })

/** Per-country help numbers (offline copy on devices is synced from here). */
export class HelpDirectory extends Context.Service<
  HelpDirectory,
  {
    forCountry(country: Country): Effect.Effect<ReadonlyArray<DirectoryEntry>, PersistenceError>
    emergencyContacts(
      country: Country,
      locale: Locale
    ): Effect.Effect<ReadonlyArray<EmergencyContact>, PersistenceError>
  }
>()("@dadalink/core/HelpDirectory") {
  static readonly layer = Layer.effect(
    HelpDirectory,
    Effect.gen(function* () {
      const repo = yield* DirectoryRepo

      const forCountry = Effect.fn("HelpDirectory.forCountry")((country: Country) => repo.listByCountry(country))

      const emergencyContacts = Effect.fn("HelpDirectory.emergencyContacts")((country: Country, locale: Locale) =>
        repo.listByCountry(country).pipe(Effect.map((entries) => toEmergencyContacts(entries, locale)))
      )

      return HelpDirectory.of({ forCountry, emergencyContacts })
    })
  )
}
