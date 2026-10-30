import { Context, Effect, Layer, Ref, Stream } from "effect"
import { AiError, LanguageModel, type Prompt, type Response } from "effect/ai"

/** What the fake model saw: flattened system and user text of each call. */
export interface FakeModelCall {
  readonly system: string
  readonly user: string
}

export class FakeModelCalls extends Context.Service<FakeModelCalls, Ref.Ref<ReadonlyArray<FakeModelCall>>>()(
  "@dadalink/adapters/ai/FakeModelCalls"
) {}

export interface FakeLanguageModelOptions {
  /** Produces the answer from the flattened prompt. Defaults to a deterministic cited answer. */
  readonly respond?: (call: FakeModelCall) => string
  /** Fail every call with an `AiError`, to exercise upstream failure handling. */
  readonly fail?: boolean
}

const textOf = (message: Prompt.Message): string =>
  typeof message.content === "string"
    ? message.content
    : message.content.flatMap((part) => (part.type === "text" ? [part.text] : [])).join("\n")

const flatten = (prompt: Prompt.Prompt): FakeModelCall => ({
  system: prompt.content
    .filter((m) => m.role === "system")
    .map(textOf)
    .join("\n"),
  user: prompt.content
    .filter((m) => m.role === "user")
    .map(textOf)
    .join("\n")
})

const firstSourceTitle = (system: string) => /^\[1\] (.+?) \(id:/m.exec(system)?.[1]

/** Deterministic default: a short answer citing source [1]. Used by tests and `DADALINK_AI_PROVIDER=fake`. */
export const defaultFakeAnswer = (call: FakeModelCall): string => {
  const title = firstSourceTitle(call.system)
  return title === undefined
    ? "This is the DadaLink development model. I could not find a source to cite."
    : `This is the DadaLink development model. The reviewed article "${title}" explains what you can do. [1]\n\nSources: [1] ${title}`
}

const failure = () =>
  new AiError.AiError({
    module: "FakeLanguageModel",
    method: "generateText",
    reason: new AiError.UnknownError({ description: "Fake model configured to fail" })
  })

const finish: Response.FinishPartEncoded = {
  type: "finish",
  reason: "stop",
  usage: { inputTokens: { total: 0 }, outputTokens: { total: 0 } }
}

/**
 * Offline `LanguageModel` that never calls a provider. It records every call
 * in `FakeModelCalls` so tests can assert on prompts.
 */
export const FakeLanguageModel = {
  layer: (options: FakeLanguageModelOptions = {}) =>
    Layer.effect(
      LanguageModel.LanguageModel,
      Effect.gen(function* () {
        const calls = yield* FakeModelCalls
        const respond = options.respond ?? defaultFakeAnswer
        const record = (prompt: Prompt.Prompt) =>
          Effect.gen(function* () {
            const call = flatten(prompt)
            yield* Ref.update(calls, (all) => [...all, call])
            if (options.fail === true) return yield* failure()
            return respond(call)
          })

        return yield* LanguageModel.make({
          generateText: (providerOptions) =>
            record(providerOptions.prompt).pipe(
              Effect.map((text): Array<Response.PartEncoded> => [{ type: "text", text }, finish])
            ),
          streamText: (providerOptions) =>
            Stream.unwrap(
              record(providerOptions.prompt).pipe(
                Effect.map((text) => {
                  const words = text.split(/(?<=\s)/u)
                  const parts: Array<Response.StreamPartEncoded> = [
                    { type: "text-start", id: "0" },
                    ...words.map((delta): Response.StreamPartEncoded => ({ type: "text-delta", id: "0", delta })),
                    { type: "text-end", id: "0" },
                    finish
                  ]
                  return Stream.fromIterable(parts)
                })
              )
            )
        })
      })
    ).pipe(Layer.provideMerge(Layer.effect(FakeModelCalls, Ref.make<ReadonlyArray<FakeModelCall>>([]))))
}
