import { mkdirSync } from "node:fs"
import { dirname } from "node:path"
import { RepositoriesLive } from "@dadalink/db"
import { DatabaseNode } from "@dadalink/db/node"
import { makeHttpApp } from "@dadalink/server"
import { Effect, Layer, Option } from "effect"
import { ServerConfig } from "./config.ts"

/** SQLite file (created on first start) + migrations + every repository. */
export const PersistenceLive = (filename: string) =>
  RepositoriesLive.pipe(Layer.provide(DatabaseNode.layer({ filename })))

const ensureParentDirectory = (filename: string) =>
  Effect.sync(() => {
    if (filename !== ":memory:") mkdirSync(dirname(filename), { recursive: true })
  })

/** The whole HTTP application for the self-hosted target, configured from the environment. */
export const AppLive = Layer.unwrap(
  Effect.gen(function* () {
    const config = yield* ServerConfig
    yield* ensureParentDirectory(config.databaseFile)
    const app = makeHttpApp(
      Option.match(config.allowedOrigins, { onNone: () => ({}), onSome: (allowedOrigins) => ({ allowedOrigins }) })
    )
    return app.pipe(Layer.provide(PersistenceLive(config.databaseFile)))
  })
)
