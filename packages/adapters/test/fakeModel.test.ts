import { describe, expect, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer, Ref } from "effect"
import { LanguageModel, Prompt } from "effect/ai"
import { FakeLanguageModel, FakeModelCalls, LanguageModelLive } from "../src/index.ts"

const prompt = Prompt.make([
  { role: "system", content: "SOURCES:\n[1] Unpaid wages (id: abroad-unpaid-wages, language: en)\nbody" },
  { role: "user", content: "Her question:\nsalary" }
])

describe("FakeLanguageModel", () => {
  it.effect("records calls and answers citing the first source", () =>
    Effect.gen(function* () {
      const response = yield* LanguageModel.generateText({ prompt })
      expect(response.text).toContain('"Unpaid wages"')
      expect(response.text).toContain("[1]")
      const calls = yield* Ref.get(yield* FakeModelCalls)
      expect(calls[0]?.user).toContain("salary")
    }).pipe(Effect.provide(FakeLanguageModel.layer()))
  )

  it.effect("is selected by DADALINK_AI_PROVIDER=fake", () =>
    Effect.gen(function* () {
      const response = yield* LanguageModel.generateText({ prompt })
      expect(response.text).toContain("development model")
    }).pipe(
      Effect.provide(
        LanguageModelLive.pipe(
          Layer.provide(ConfigProvider.layer(ConfigProvider.fromEnvRecord({ DADALINK_AI_PROVIDER: "fake" })))
        )
      )
    )
  )
})
