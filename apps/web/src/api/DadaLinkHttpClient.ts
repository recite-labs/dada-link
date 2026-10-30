import { Api } from "@dadalink/api"
import { Context, Layer } from "effect"
import { FetchHttpClient } from "effect/http"
import { HttpApiClient } from "effect/http-api"

export interface ApiClientConfig {
  /** Origin (and optional path) of the API; the web app normally uses its own origin. */
  readonly baseUrl: string
  /** Injected in tests; defaults to the platform `fetch`. */
  readonly fetch?: typeof globalThis.fetch
}

/** The typed client derived from the shared HttpApi contract. */
export class DadaLinkHttpClient extends Context.Service<DadaLinkHttpClient, HttpApiClient.ForApi<typeof Api>>()(
  "@dadalink/web/api/DadaLinkHttpClient"
) {
  static readonly layer = (config: ApiClientConfig) =>
    Layer.effect(DadaLinkHttpClient, HttpApiClient.make(Api, { baseUrl: config.baseUrl })).pipe(
      Layer.provide(FetchHttpClient.layer),
      Layer.provide(config.fetch === undefined ? Layer.empty : Layer.succeed(FetchHttpClient.Fetch)(config.fetch))
    )
}
