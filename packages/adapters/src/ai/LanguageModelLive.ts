import { Config, Effect, Layer } from "effect"
import { AnthropicLanguageModelLive } from "./AnthropicModel.ts"
import { FakeLanguageModel } from "./FakeLanguageModel.ts"

/**
 * Chooses the model provider from `DADALINK_AI_PROVIDER`:
 * `anthropic` (default) or `fake` (offline, deterministic; for development and smoke tests).
 */
export const AiProvider = Config.Literals(["anthropic", "fake"], "DADALINK_AI_PROVIDER").pipe(
  Config.withDefault("anthropic")
)

export const LanguageModelLive = Layer.unwrap(
  Effect.gen(function* () {
    const provider = yield* AiProvider
    return provider === "fake" ? FakeLanguageModel.layer() : AnthropicLanguageModelLive
  })
)
