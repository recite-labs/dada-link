import { HttpApi, OpenApi } from "effect/http-api"
import { AgenciesApi } from "./groups/Agencies.ts"
import { AssistantApi } from "./groups/Assistant.ts"
import { ContentApi } from "./groups/Content.ts"
import { DirectoryApi } from "./groups/Directory.ts"
import { HealthApi } from "./groups/Health.ts"
import { SafetyApi } from "./groups/Safety.ts"
import { TelegramApi } from "./groups/Telegram.ts"

/** The DadaLink HTTP contract, shared by server, web client and OpenAPI. */
export class Api extends HttpApi.make("dadalink")
  .add(HealthApi)
  .add(ContentApi)
  .add(DirectoryApi)
  .add(AgenciesApi)
  .add(AssistantApi)
  .add(SafetyApi)
  .add(TelegramApi)
  .annotateMerge(
    OpenApi.annotations({
      title: "DadaLink API",
      version: "0.1.0",
      description: "Safety-first companion for African women migrant domestic workers."
    })
  ) {}
