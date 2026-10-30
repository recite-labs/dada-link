import { createServer } from "node:http"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import { HttpRouter } from "effect/http"
import { AppLive } from "./AppLayer.ts"
import { ServerConfig } from "./config.ts"

const HttpServerLive = Layer.unwrap(
  Effect.map(ServerConfig, ({ port, host }) =>
    HttpRouter.serve(AppLive).pipe(Layer.provide(NodeHttpServer.layer(createServer, { port, host })))
  )
)

Layer.launch(HttpServerLive).pipe(NodeRuntime.runMain)
