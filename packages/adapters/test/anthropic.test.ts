import { describe, expect, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer, Option, Redacted } from "effect"
import { LanguageModel } from "effect/ai"
import { HttpClient, type HttpClientRequest, HttpClientResponse } from "effect/http"
import { AnthropicSettings, anthropicLanguageModel, DEFAULT_MODEL } from "../src/index.ts"

const anthropicReply = {
  id: "msg_test",
  type: "message",
  role: "assistant",
  model: "claude-sonnet-5-5",
  content: [{ type: "text", text: "Hello from the stub" }],
  stop_reason: "end_turn",
  stop_sequence: null,
  usage: { input_tokens: 3, output_tokens: 4 }
}

/** HttpClient that records requests and answers like the Messages API; never touches the network. */
const capturingClient = (seen: Array<{ url: string; headers: Record<string, string>; body: unknown }>) =>
  HttpClient.make((request: HttpClientRequest.HttpClientRequest, url) =>
    Effect.sync(() => {
      const body = request.body._tag === "Uint8Array" ? JSON.parse(new TextDecoder().decode(request.body.body)) : null
      seen.push({ url: url.toString(), headers: { ...request.headers }, body })
      return HttpClientResponse.fromWeb(
        request,
        new Response(JSON.stringify(anthropicReply), { status: 200, headers: { "content-type": "application/json" } })
      )
    })
  )

describe("Anthropic LanguageModel adapter", () => {
  it.effect("calls the configured base URL (AI Gateway) with model, key and gateway token", () => {
    const seen: Array<{ url: string; headers: Record<string, string>; body: unknown }> = []
    const layer = anthropicLanguageModel({
      apiKey: Option.some(Redacted.make("sk-test")),
      model: "claude-sonnet-5-5",
      baseUrl: Option.some("https://gateway.ai.cloudflare.com/v1/acct/gw/anthropic"),
      gatewayToken: Option.some(Redacted.make("gw-token")),
      maxOutputTokens: 256
    }).pipe(Layer.provide(Layer.succeed(HttpClient.HttpClient, capturingClient(seen))))

    return Effect.gen(function* () {
      const response = yield* LanguageModel.generateText({ prompt: "Hi" }).pipe(Effect.result)
      expect(seen).toHaveLength(1)
      const [request] = seen
      expect(request?.url.startsWith("https://gateway.ai.cloudflare.com/v1/acct/gw/anthropic/v1/messages")).toBe(true)
      expect(request?.headers["x-api-key"]).toBe("sk-test")
      expect(request?.headers["cf-aig-authorization"]).toBe("Bearer gw-token")
      expect(request?.body).toMatchObject({ model: "claude-sonnet-5-5", max_tokens: 256 })
      if (response._tag === "Success") expect(response.success.text).toBe("Hello from the stub")
    }).pipe(Effect.provide(layer))
  })

  it.effect("uses a key stored in AI Gateway: sends only the gateway token, no x-api-key", () => {
    const seen: Array<{ url: string; headers: Record<string, string>; body: unknown }> = []
    const layer = anthropicLanguageModel({
      apiKey: Option.none(),
      model: "claude-sonnet-5-5",
      baseUrl: Option.some("https://gateway.ai.cloudflare.com/v1/acct/gw/anthropic"),
      gatewayToken: Option.some(Redacted.make("gw-token")),
      maxOutputTokens: 256
    }).pipe(Layer.provide(Layer.succeed(HttpClient.HttpClient, capturingClient(seen))))

    return Effect.gen(function* () {
      yield* LanguageModel.generateText({ prompt: "Hi" }).pipe(Effect.result)
      const [request] = seen
      expect(request?.headers["cf-aig-authorization"]).toBe("Bearer gw-token")
      expect(request?.headers["x-api-key"]).toBeUndefined()
    }).pipe(Effect.provide(layer))
  })

  it.effect("accepts a gateway token without an API key", () =>
    Effect.gen(function* () {
      const settings = yield* AnthropicSettings
      expect(Option.isNone(settings.apiKey)).toBe(true)
      expect(Option.isSome(settings.gatewayToken)).toBe(true)
    }).pipe(Effect.provide(ConfigProvider.layer(ConfigProvider.fromEnvRecord({ DADALINK_AI_GATEWAY_TOKEN: "gw-env" }))))
  )

  it.effect("reads settings from the environment with sensible defaults", () =>
    Effect.gen(function* () {
      const settings = yield* AnthropicSettings
      expect(settings.model).toBe(DEFAULT_MODEL)
      expect(DEFAULT_MODEL).toBe("claude-sonnet-5-5")
      expect(Option.map(settings.apiKey, Redacted.value)).toEqual(Option.some("sk-env"))
      expect(Option.isNone(settings.baseUrl)).toBe(true)
      expect(settings.maxOutputTokens).toBe(1024)
    }).pipe(Effect.provide(ConfigProvider.layer(ConfigProvider.fromEnvRecord({ ANTHROPIC_API_KEY: "sk-env" }))))
  )

  it.effect("fails fast without an API key or a gateway token", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(
        Effect.gen(function* () {
          return yield* AnthropicSettings
        })
      )
      expect(String(error)).toContain("ANTHROPIC_API_KEY")
      expect(String(error)).toContain("DADALINK_AI_GATEWAY_TOKEN")
    }).pipe(Effect.provide(ConfigProvider.layer(ConfigProvider.fromEnvRecord({}))))
  )
})
