import { AgencyCheck } from "@dadalink/domain"
import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api"
import { ValidationError } from "../errors.ts"

export class AgenciesApi extends HttpApiGroup.make("agencies")
  .add(
    HttpApiEndpoint.get("check", "/check", {
      query: { q: Schema.String.check(Schema.isMaxLength(200)) },
      success: AgencyCheck,
      error: ValidationError
    })
  )
  .prefix("/agencies")
  .annotateMerge(
    OpenApi.annotations({
      title: "Agencies",
      description: "Check a recruitment agency against the published licensed-agency list"
    })
  ) {}
