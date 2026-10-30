import { SosRequest, SosResult } from "@dadalink/domain"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api"
import { RateLimitedError, UpstreamError } from "../errors.ts"

export class SafetyApi extends HttpApiGroup.make("safety")
  .add(
    HttpApiEndpoint.post("sos", "/sos", {
      payload: SosRequest,
      success: SosResult,
      error: [RateLimitedError, UpstreamError]
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Relay an SOS to the trusted contact",
        description:
          "Sends the alert (optional message and location link) by SMS and/or Telegram. Nothing is stored. 503 means no channel succeeded: the client must fall back to the phone's own SMS."
      })
    )
  )
  .prefix("/safety")
  .annotateMerge(OpenApi.annotations({ title: "Safety" })) {}
