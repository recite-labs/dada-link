import type { TelegramChatId } from "@dadalink/domain"
import { Context, type Effect, Schema } from "effect"

export class MessengerUnavailable extends Schema.TaggedError<MessengerUnavailable>()("MessengerUnavailable", {
  reason: Schema.String
}) {}

export type InlineButton =
  | { readonly text: string; readonly callbackData: string }
  | { readonly text: string; readonly url: string }

export interface OutgoingMessage {
  readonly chatId: TelegramChatId
  readonly text: string
  /** Rows of inline buttons. */
  readonly buttons?: ReadonlyArray<ReadonlyArray<InlineButton>>
}

/** Messaging channel used by the bot and the SOS relay (Telegram Bot API). */
export class MessengerBot extends Context.Service<
  MessengerBot,
  {
    sendMessage(message: OutgoingMessage): Effect.Effect<void, MessengerUnavailable>
    answerCallback(callbackQueryId: string): Effect.Effect<void, MessengerUnavailable>
  }
>()("@dadalink/ports/MessengerBot") {}
