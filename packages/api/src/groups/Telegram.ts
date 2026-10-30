import { TelegramUpdate } from "@dadalink/domain"
import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "effect/http-api"
import { WebhookUnauthorizedError } from "../errors.ts"

export const TELEGRAM_SECRET_HEADER = "x-telegram-bot-api-secret-token"

export class TelegramApi extends HttpApiGroup.make("telegram")
  .add(
    HttpApiEndpoint.post("webhook", "/webhook", {
      headers: { [TELEGRAM_SECRET_HEADER]: Schema.optionalKey(Schema.String) },
      payload: TelegramUpdate,
      success: HttpApiSchema.NoContent,
      error: WebhookUnauthorizedError
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Telegram webhook",
        description:
          "Verified with the X-Telegram-Bot-Api-Secret-Token header. Acknowledged immediately; the update is processed in the background."
      })
    )
  )
  .prefix("/telegram")
  .annotateMerge(OpenApi.annotations({ title: "Telegram" })) {}
