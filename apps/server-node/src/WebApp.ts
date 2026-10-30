import { Config, Effect, FileSystem, Layer, Option, Path } from "effect"
import { HttpStaticServer } from "effect/http"

/** Hashed build assets never change under the same name. */
const IMMUTABLE = "public, max-age=31536000, immutable"

/**
 * Serves the built web app (`apps/web/dist`) from the same origin as the API.
 * API routes are registered more specifically and always win; any other GET
 * without a file extension that accepts HTML falls back to `index.html`, so
 * client-side routes like `/am/help/SA` work on reload.
 */
export const webAppLayer = (root: string) =>
  Layer.mergeAll(
    HttpStaticServer.layer({ root: `${root}/assets`, prefix: "/assets", cacheControl: IMMUTABLE }),
    HttpStaticServer.layer({ root, spa: true, cacheControl: "no-cache" })
  )

/**
 * Mounts the web app when `DADALINK_WEB_DIR` points at a build containing
 * `index.html`; otherwise the server is API-only.
 */
export const WebAppLive = Layer.unwrap(
  Effect.gen(function* () {
    const configured = yield* Config.String("DADALINK_WEB_DIR").pipe(Config.option)
    if (Option.isNone(configured)) return Layer.empty
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const root = path.resolve(configured.value)
    const built = yield* fs.exists(path.join(root, "index.html")).pipe(Effect.orElseSucceed(() => false))
    if (!built) {
      yield* Effect.logWarning(
        `DADALINK_WEB_DIR=${root} has no index.html; run \`pnpm --filter @dadalink/web build\`. Serving the API only.`
      )
      return Layer.empty
    }
    yield* Effect.logInfo(`Serving the web app from ${root}`)
    return webAppLayer(root)
  })
)
