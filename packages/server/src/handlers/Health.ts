import { Api, HealthStatus } from "@dadalink/api"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/http-api"

export const API_VERSION = "0.1.0"

export const HealthHandlers = HttpApiBuilder.group(Api, "health", (handlers) =>
  handlers.handle("health", () =>
    Effect.succeed(new HealthStatus({ status: "ok", service: "dadalink", version: API_VERSION }))
  )
)
