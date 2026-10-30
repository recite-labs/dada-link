import { Assistant, CatalogServicesLive, HelpDirectory, SosRelay } from "@dadalink/core"
import { Layer } from "effect"
import { AgenciesHandlers } from "./handlers/Agencies.ts"
import { AssistantHandlers } from "./handlers/Assistant.ts"
import { ContentHandlers } from "./handlers/Content.ts"
import { DirectoryHandlers } from "./handlers/Directory.ts"
import { HealthHandlers } from "./handlers/Health.ts"
import { SafetyHandlers } from "./handlers/Safety.ts"

/** Use cases wired together; requires ports, `LanguageModel`, `Pseudonymizer` and settings. */
export const UseCasesLive = Layer.mergeAll(
  CatalogServicesLive,
  Assistant.layer.pipe(Layer.provide(HelpDirectory.layer)),
  SosRelay.layer
)

/** Every API group implemented, with use cases wired. */
export const HandlersLive = Layer.mergeAll(
  HealthHandlers,
  ContentHandlers,
  DirectoryHandlers,
  AgenciesHandlers,
  AssistantHandlers,
  SafetyHandlers
).pipe(Layer.provide(UseCasesLive))
