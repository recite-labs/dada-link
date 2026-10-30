import { AssistantFeedback } from "@dadalink/domain"
import { FeedbackRepo } from "@dadalink/ports"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Schema } from "effect"
import { Database } from "../src/index.ts"
import { assistantFeedback } from "../src/schema/index.ts"
import { makeSqliteTestLayer } from "./layers.ts"

describe("FeedbackRepo (SQLite)", () => {
  it.effect("stores only the helpful flag, locale, content ids and a day-precision date", () =>
    Effect.gen(function* () {
      const feedback = Schema.decodeUnknownSync(AssistantFeedback)({
        helpful: true,
        locale: "am",
        contentIds: ["abroad-unpaid-wages"]
      })
      yield* (yield* FeedbackRepo).record(feedback)
      const db = yield* Database
      const rows = yield* db.select().from(assistantFeedback)
      expect(rows).toHaveLength(1)
      expect(rows[0]).toMatchObject({ helpful: true, locale: "am", contentIds: ["abroad-unpaid-wages"] })
      expect(rows[0]?.day).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }).pipe(Effect.provide(makeSqliteTestLayer()))
  )
})
