import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api"

export class HealthStatus extends Schema.Class<HealthStatus>("HealthStatus")({
  status: Schema.Literal("ok"),
  service: Schema.Literal("dadalink"),
  version: Schema.String
}) {}

export class HealthApi extends HttpApiGroup.make("health", { topLevel: true })
  .add(HttpApiEndpoint.get("health", "/health", { success: HealthStatus }))
  .annotateMerge(OpenApi.annotations({ title: "Health" })) {}
