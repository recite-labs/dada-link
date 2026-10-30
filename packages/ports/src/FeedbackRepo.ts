import type { AssistantFeedback } from "@dadalink/domain"
import { Context, type Effect } from "effect"
import type { PersistenceError } from "./errors.ts"

/** Opt-in, content-free assistant feedback (helpful yes/no + cited content ids). */
export class FeedbackRepo extends Context.Service<
  FeedbackRepo,
  {
    record(feedback: AssistantFeedback): Effect.Effect<void, PersistenceError>
  }
>()("@dadalink/ports/FeedbackRepo") {}
