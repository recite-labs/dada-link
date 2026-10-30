import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic"
import { Config, Effect, Layer, Option, Redacted } from "effect"
import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/http"

export const DEFAULT_MODEL = "claude-sonnet-5-5"
export const DEFAULT_MAX_OUTPUT_TOKENS = 1024

/**
 * Anthropic settings, from the environment:
 * - `ANTHROPIC_API_KEY` (secret)
 * - `DADALINK_AI_MODEL` (default `claude-sonnet-5-5`)
 * - `DADALINK_AI_BASE_URL` e.g. a Cloudflare AI Gateway URL
 *   `https://gateway.ai.cloudflare.com/v1/<account>/<gateway>/anthropic`
 * - `DADALINK_AI_GATEWAY_TOKEN` (optional secret, sent as `cf-aig-authorization`)
 * - `DADALINK_AI_MAX_OUTPUT_TOKENS` (default 1024)
 */
export const AnthropicSettings = Config.all({
  apiKey: Config.Redacted("ANTHROPIC_API_KEY"),
  model: Config.String("DADALINK_AI_MODEL").pipe(Config.withDefault(DEFAULT_MODEL)),
  baseUrl: Config.String("DADALINK_AI_BASE_URL").pipe(Config.option),
  gatewayToken: Config.Redacted("DADALINK_AI_GATEWAY_TOKEN").pipe(Config.option),
  maxOutputTokens: Config.Int("DADALINK_AI_MAX_OUTPUT_TOKENS").pipe(Config.withDefault(DEFAULT_MAX_OUTPUT_TOKENS))
})
export type AnthropicSettings = typeof AnthropicSettings extends Config.Config<infer A> ? A : never

/** Adds the AI Gateway authentication header when a gateway token is configured. */
export const withGatewayToken =
  (token: Option.Option<Redacted.Redacted<string>>) =>
  (client: HttpClient.HttpClient): HttpClient.HttpClient =>
    Option.match(token, {
      onNone: () => client,
      onSome: (secret) =>
        HttpClient.mapRequest(
          client,
          HttpClientRequest.setHeader("cf-aig-authorization", `Bearer ${Redacted.value(secret)}`)
        )
    })

/** `LanguageModel` backed by Claude, built from explicit settings; requires an `HttpClient`. */
export const anthropicLanguageModel = (settings: AnthropicSettings) =>
  AnthropicLanguageModel.layer({
    model: settings.model,
    config: { max_tokens: settings.maxOutputTokens }
  }).pipe(
    Layer.provide(
      AnthropicClient.layer({
        apiKey: settings.apiKey,
        ...Option.match(settings.baseUrl, { onNone: () => ({}), onSome: (apiUrl) => ({ apiUrl }) }),
        transformClient: withGatewayToken(settings.gatewayToken)
      })
    )
  )

/** `LanguageModel` backed by Claude, configured from the environment. */
export const AnthropicLanguageModelLive = Layer.unwrap(
  Effect.gen(function* () {
    return anthropicLanguageModel(yield* AnthropicSettings)
  })
).pipe(Layer.provide(FetchHttpClient.layer))
