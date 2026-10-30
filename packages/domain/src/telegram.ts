import { Schema } from "effect"
import { TelegramChatId } from "./ids.ts"

/**
 * The subset of a Telegram Bot API `Update` DadaLink uses. Unknown fields are
 * ignored, so new Telegram features never break the webhook. Field names
 * follow the Bot API (snake_case).
 */
export const TelegramChat = Schema.Struct({ id: TelegramChatId })

export const TelegramUser = Schema.Struct({
  language_code: Schema.optionalKey(Schema.String)
})

export const TelegramMessage = Schema.Struct({
  message_id: Schema.Int,
  chat: TelegramChat,
  from: Schema.optionalKey(TelegramUser),
  text: Schema.optionalKey(Schema.String)
})
export type TelegramMessage = typeof TelegramMessage.Type

export const TelegramCallbackQuery = Schema.Struct({
  id: Schema.String,
  from: Schema.optionalKey(TelegramUser),
  data: Schema.optionalKey(Schema.String),
  message: Schema.optionalKey(Schema.Struct({ chat: TelegramChat }))
})
export type TelegramCallbackQuery = typeof TelegramCallbackQuery.Type

export const TelegramUpdate = Schema.Struct({
  update_id: Schema.Int,
  message: Schema.optionalKey(TelegramMessage),
  callback_query: Schema.optionalKey(TelegramCallbackQuery)
}).annotate({ identifier: "TelegramUpdate" })
export type TelegramUpdate = typeof TelegramUpdate.Type
