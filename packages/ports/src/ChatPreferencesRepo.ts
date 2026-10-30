import type { Country, Locale } from "@dadalink/domain"
import { Context, type Effect, type Option } from "effect"
import type { PersistenceError } from "./errors.ts"

export interface ChatPreferences {
  readonly locale: Locale
  readonly country?: Country
}

/** Per-chat bot settings keyed by a hashed chat id (never the raw id). */
export class ChatPreferencesRepo extends Context.Service<
  ChatPreferencesRepo,
  {
    get(chatHash: string): Effect.Effect<Option.Option<ChatPreferences>, PersistenceError>
    set(chatHash: string, preferences: ChatPreferences): Effect.Effect<void, PersistenceError>
  }
>()("@dadalink/ports/ChatPreferencesRepo") {}
