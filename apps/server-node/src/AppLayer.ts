import { mkdirSync } from "node:fs"
import { dirname } from "node:path"
import { LanguageModelLive } from "@dadalink/adapters"
import { AssistantSettings, Pseudonymizer } from "@dadalink/core"
import { RepositoriesLive } from "@dadalink/db"
import { DatabaseNode } from "@dadalink/db/node"
import { makeHttpApp } from "@dadalink/server"
import { Effect, Layer, Option } from "effect"
import { ServerConfig } from "./config.ts"

/** SQLite file (created on first start) + migrations + every repository. */
export const PersistenceLive = (filename: string) =>
  RepositoriesLive.pipe(Layer.provide(DatabaseNode.layer({ filename })))

/** Everything the use cases need that is not persistence, configured from the environment. */
export const ServicesLive = Layer.mergeAll(LanguageModelLive, Pseudonymizer.layerConfig, AssistantSettings.layerConfig)

const ensureParentDirectory = (filename: string) =>
  Effect.sync(() => {
    if (filename !== ":memory:") mkdirSync(dirname(filename), { recursive: true })
  })

/** The whole HTTP application for the self-hosted target. */
export const AppLive = Layer.unwrap(
  Effect.gen(function* () {
    const config = yield* ServerConfig
    yield* ensureParentDirectory(config.databaseFile)
    const app = makeHttpApp(
      Option.match(config.allowedOrigins, { onNone: () => ({}), onSome: (allowedOrigins) => ({ allowedOrigins }) })
    )
    return app.pipe(Layer.provide(Layer.mergeAll(PersistenceLive(config.databaseFile), ServicesLive)))
  })
)
