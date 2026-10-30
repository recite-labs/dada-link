import { Api } from "@dadalink/api"
import { Layer } from "effect"
import { HttpRouter } from "effect/http"
import { HttpApiBuilder } from "effect/http-api"
import { HandlersLive } from "./HandlersLive.ts"

export interface HttpAppOptions {
  /** Origins allowed by CORS (the web app). Defaults to any origin: the API is public and cookie-less. */
  readonly allowedOrigins?: ReadonlyArray<string>
}

const cors = (allowedOrigins: ReadonlyArray<string> | undefined) =>
  HttpRouter.cors({
    ...(allowedOrigins === undefined ? {} : { allowedOrigins }),
    allowedMethods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["content-type"],
    maxAge: 600
  })

/**
 * Platform-agnostic HTTP application: API routes, `/openapi.json` and CORS.
 * Apps serve it with NodeHttpServer or turn it into a Workers fetch handler.
 */
export const makeHttpApp = (options: HttpAppOptions = {}) =>
  Layer.mergeAll(HttpApiBuilder.layer(Api, { openapiPath: "/openapi.json" }), cors(options.allowedOrigins)).pipe(
    Layer.provide(HandlersLive)
  )
