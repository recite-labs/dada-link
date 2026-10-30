import type { Agency, AgencyVerdict } from "@dadalink/domain"
import { AgencyCheck, normalizeAgencyName, normalizeLicence, ValidationFailed } from "@dadalink/domain"
import { AgencyRepo, type PersistenceError } from "@dadalink/ports"
import { Context, Effect, Layer } from "effect"

const MIN_QUERY_LENGTH = 3
const MAX_MATCHES = 10

/** Pure: a single verdict is only given when all matches agree. */
export const verdictFor = (matches: ReadonlyArray<Agency>): AgencyVerdict => {
  const [first] = matches
  if (first === undefined) return "not-found"
  return matches.every((a) => a.status === first.status) ? first.status : "unknown"
}

/** "Is this recruitment agency licensed?" by licence number or name. */
export class AgencyChecker extends Context.Service<
  AgencyChecker,
  {
    check(query: string): Effect.Effect<AgencyCheck, ValidationFailed | PersistenceError>
  }
>()("@dadalink/core/AgencyChecker") {
  static readonly layer = Layer.effect(
    AgencyChecker,
    Effect.gen(function* () {
      const repo = yield* AgencyRepo

      const check = Effect.fn("AgencyChecker.check")(function* (query: string) {
        const name = normalizeAgencyName(query)
        const licence = normalizeLicence(query)
        if (name.length < MIN_QUERY_LENGTH && licence.length < MIN_QUERY_LENGTH) {
          return yield* new ValidationFailed({ reason: "Please enter at least 3 letters or digits" })
        }
        const byLicence = /\d/.test(licence) ? yield* repo.findByLicence(licence) : []
        const matches =
          byLicence.length > 0 || name.length < MIN_QUERY_LENGTH
            ? byLicence
            : yield* repo.searchByName(name, MAX_MATCHES)
        return new AgencyCheck({ query, verdict: verdictFor(matches), matches })
      })

      return AgencyChecker.of({ check })
    })
  )
}
