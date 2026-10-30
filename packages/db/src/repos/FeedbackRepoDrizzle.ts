import type { AssistantFeedback } from "@dadalink/domain"
import { FeedbackRepo } from "@dadalink/ports"
import { DateTime, Effect, Layer } from "effect"
import { Database } from "../Database.ts"
import { persistence } from "../persistence.ts"
import { assistantFeedback } from "../schema/index.ts"

export const FeedbackRepoDrizzle = Layer.effect(
  FeedbackRepo,
  Effect.gen(function* () {
    const db = yield* Database

    const record = Effect.fn("FeedbackRepo.record")((feedback: AssistantFeedback) =>
      Effect.gen(function* () {
        const now = yield* DateTime.now
        yield* db.insert(assistantFeedback).values({
          day: DateTime.formatIsoDateUtc(now),
          helpful: feedback.helpful,
          locale: feedback.locale,
          contentIds: feedback.contentIds
        })
      }).pipe(persistence("FeedbackRepo.record"))
    )

    return FeedbackRepo.of({ record })
  })
)
