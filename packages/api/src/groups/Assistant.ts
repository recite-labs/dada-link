import { AskRequest, AskResponse, AssistantFeedback, AssistantStreamEvent, UpstreamUnavailable } from "@dadalink/domain"
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "effect/http-api"
import { RateLimitedError, UpstreamError } from "../errors.ts"

export class AssistantApi extends HttpApiGroup.make("assistant")
  .add(
    HttpApiEndpoint.post("ask", "/ask", {
      payload: AskRequest,
      success: AskResponse,
      error: [RateLimitedError, UpstreamError]
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Ask Dada",
        description:
          "Answers only from reviewed content, with citations, in the requested locale. When danger is detected the answer starts with SOS and local emergency numbers. Nothing is stored."
      })
    ),
    HttpApiEndpoint.post("askStream", "/ask/stream", {
      payload: AskRequest,
      success: HttpApiSchema.StreamSse({ data: AssistantStreamEvent, error: UpstreamUnavailable }),
      error: RateLimitedError
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Ask Dada (server-sent events)",
        description: "Emits Emergency (optional), Citations, Delta* and Done events."
      })
    ),
    HttpApiEndpoint.post("feedback", "/feedback", {
      payload: AssistantFeedback,
      success: HttpApiSchema.NoContent
    }).annotateMerge(
      OpenApi.annotations({ summary: "Opt-in feedback", description: "Helpful yes/no and cited content ids only." })
    )
  )
  .prefix("/assistant")
  .annotateMerge(OpenApi.annotations({ title: "Assistant" })) {}
