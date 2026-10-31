import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic"
import { Config, ConfigProvider, Effect, Layer, Option, Redacted } from "effect"
import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/http"

export const DEFAULT_MODEL = "claude-sonnet-5-5"
export const DEFAULT_MAX_OUTPUT_TOKENS = 1024

const missingCredentials = new Config.ConfigError(
  new ConfigProvider.SourceError({
    message:
      "Set ANTHROPIC_API_KEY, or DADALINK_AI_GATEWAY_TOKEN when the Anthropic key is stored in Cloudflare AI Gateway"
  })
)

/**
 * Anthropic settings, from the environment:
 * - `ANTHROPIC_API_KEY` (secret; optional when the key is stored in AI Gateway)
 * - `DADALINK_AI_MODEL` (default `claude-sonnet-5-5`)
 * - `DADALINK_AI_BASE_URL` e.g. a Cloudflare AI Gateway URL
 *   `https://gateway.ai.cloudflare.com/v1/<account>/<gateway>/anthropic`
 * - `DADALINK_AI_GATEWAY_TOKEN` (optional secret, sent as `cf-aig-authorization`)
 * - `DADALINK_AI_MAX_OUTPUT_TOKENS` (default 1024)
 *
 * At least one of `ANTHROPIC_API_KEY` and `DADALINK_AI_GATEWAY_TOKEN` is required.
 */
export const AnthropicSettings = Config.all({
  apiKey: Config.Redacted("ANTHROPIC_API_KEY").pipe(Config.option),
  model: Config.String("DADALINK_AI_MODEL").pipe(Config.withDefault(DEFAULT_MODEL)),
  baseUrl: Config.String("DADALINK_AI_BASE_URL").pipe(Config.option),
  gatewayToken: Config.Redacted("DADALINK_AI_GATEWAY_TOKEN").pipe(Config.option),
  maxOutputTokens: Config.Int("DADALINK_AI_MAX_OUTPUT_TOKENS").pipe(Config.withDefault(DEFAULT_MAX_OUTPUT_TOKENS))
}).pipe(
  Config.mapEffect((settings) =>
    Option.isNone(settings.apiKey) && Option.isNone(settings.gatewayToken)
      ? Effect.fail(missingCredentials)
      : Effect.succeed(settings)
  )
)
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
        ...Option.match(settings.apiKey, { onNone: () => ({}), onSome: (apiKey) => ({ apiKey }) }),
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
