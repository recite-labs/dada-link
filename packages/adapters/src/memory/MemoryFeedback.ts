import type { AssistantFeedback } from "@dadalink/domain"
import { FeedbackRepo } from "@dadalink/ports"
import { Context, Effect, Layer, Ref } from "effect"

/** Recorded feedback, exposed so tests can assert on it. */
export class MemoryFeedbackLog extends Context.Service<MemoryFeedbackLog, Ref.Ref<ReadonlyArray<AssistantFeedback>>>()(
  "@dadalink/adapters/memory/MemoryFeedbackLog"
) {}

export const MemoryFeedback = {
  layer: Layer.effect(
    FeedbackRepo,
    Effect.gen(function* () {
      const log = yield* MemoryFeedbackLog
      return FeedbackRepo.of({ record: (feedback) => Ref.update(log, (all) => [...all, feedback]) })
    })
  ).pipe(Layer.provideMerge(Layer.effect(MemoryFeedbackLog, Ref.make<ReadonlyArray<AssistantFeedback>>([]))))
}
