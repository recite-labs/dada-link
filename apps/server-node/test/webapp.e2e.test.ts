import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { NodeHttpServer } from "@effect/platform-node"
import { expect, layer } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { HttpClient, HttpClientRequest, HttpRouter, HttpServerResponse } from "effect/http"
import { webAppLayer } from "../src/WebApp.ts"

/** A miniature web build: an SPA shell and one hashed asset. */
const makeBuild = () => {
  const root = mkdtempSync(join(tmpdir(), "dadalink-web-"))
  mkdirSync(join(root, "assets"))
  writeFileSync(join(root, "index.html"), "<!doctype html><div id=root></div>")
  writeFileSync(join(root, "assets", "index-abc123.js"), "console.log('app')")
  return root
}

/** An API route registered next to the static app, as `makeHttpApp` does. */
const ApiRoute = HttpRouter.add("GET", "/directory/:country", HttpServerResponse.jsonUnsafe({ api: true }))

const ServerUnderTest = HttpRouter.serve(Layer.mergeAll(ApiRoute, webAppLayer(makeBuild()))).pipe(
  Layer.provideMerge(NodeHttpServer.layerTest),
  Layer.orDie
)

const get = (path: string, accept = "text/html") =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    return yield* client.execute(HttpClientRequest.get(path).pipe(HttpClientRequest.setHeader("accept", accept)))
  })

layer(ServerUnderTest)("server-node serves the web app", (it) => {
  it.effect("returns the SPA shell for client-side routes", () =>
    Effect.gen(function* () {
      const response = yield* get("/am/help/SA")
      expect(response.status).toBe(200)
      expect(yield* response.text).toContain("<div id=root>")
      expect(response.headers["cache-control"]).toBe("no-cache")
    })
  )

  it.effect("serves the root document", () =>
    Effect.gen(function* () {
      const response = yield* get("/")
      expect(response.status).toBe(200)
      expect(yield* response.text).toContain("<!doctype html>")
    })
  )

  it.effect("serves hashed assets with long-lived caching", () =>
    Effect.gen(function* () {
      const response = yield* get("/assets/index-abc123.js", "*/*")
      expect(response.status).toBe(200)
      expect(response.headers["cache-control"]).toContain("immutable")
    })
  )

  it.effect("lets API routes win over the SPA fallback", () =>
    Effect.gen(function* () {
      const response = yield* get("/directory/SA", "application/json")
      expect(yield* response.json).toEqual({ api: true })
    })
  )

  it.effect("answers 404 for missing files instead of the shell", () =>
    Effect.gen(function* () {
      expect((yield* get("/assets/missing.js", "*/*")).status).toBe(404)
      expect((yield* get("/favicon.png", "image/*")).status).toBe(404)
    })
  )
})
