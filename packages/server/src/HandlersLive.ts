import { CatalogServicesLive } from "@dadalink/core"
import { Layer } from "effect"
import { AgenciesHandlers } from "./handlers/Agencies.ts"
import { ContentHandlers } from "./handlers/Content.ts"
import { DirectoryHandlers } from "./handlers/Directory.ts"
import { HealthHandlers } from "./handlers/Health.ts"

/** Every API group implemented, with use cases wired; requires the ports. */
export const HandlersLive = Layer.mergeAll(HealthHandlers, ContentHandlers, DirectoryHandlers, AgenciesHandlers).pipe(
  Layer.provide(CatalogServicesLive)
)
