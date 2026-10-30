import type { Country, DirectoryEntry, Locale, TelegramChatId, TelegramUpdate } from "@dadalink/domain"
import { dialableNumber, displayName } from "@dadalink/domain"
import { type ChatPreferences, ChatPreferencesRepo, type InlineButton, MessengerBot } from "@dadalink/ports"
import { Context, Effect, Layer, Option } from "effect"
import { Assistant } from "../assistant/Assistant.ts"
import { ContentCatalog } from "../content/ContentCatalog.ts"
import { HelpDirectory } from "../directory/HelpDirectory.ts"
import { Pseudonymizer } from "../privacy/Pseudonymizer.ts"
import { type BotAction, localeFromLanguageCode, parseCallbackData, parseText } from "./actions.ts"
import { BotSettings } from "./BotSettings.ts"
import { BOT_TEXTS, type BotTexts } from "./botTexts.ts"
import { countryKeyboard, helpButton, languageKeyboard, menuKeyboard } from "./keyboards.ts"

/** Telegram rejects messages longer than 4096 characters. */
const MAX_MESSAGE_LENGTH = 4000
const MAX_RIGHTS_ITEMS = 6

const clip = (text: string) => (text.length <= MAX_MESSAGE_LENGTH ? text : `${text.slice(0, MAX_MESSAGE_LENGTH)}…`)

/** Pure: help directory as a chat message, emergency numbers first, unverified entries starred. */
export const formatHelpNumbers = (
  entries: ReadonlyArray<DirectoryEntry>,
  country: Country,
  locale: Locale,
  texts: BotTexts
): string => {
  if (entries.length === 0) return texts.noHelpEntries
  const ordered = [...entries.filter((e) => e.emergency), ...entries.filter((e) => !e.emergency)]
  const lines = ordered.map((e) => {
    const number = dialableNumber(e) ?? (e.whatsapp === undefined ? texts.numberPending : `WhatsApp ${e.whatsapp}`)
    return `• ${displayName(e, locale)}: ${number}${e.verified ? "" : " *"}`
  })
  const footer = ordered.some((e) => !e.verified) ? `\n\n* ${texts.unverified}` : ""
  return `${texts.helpTitle} (${texts.countries[country]})\n\n${lines.join("\n")}${footer}`
}

interface Chat {
  readonly id: TelegramChatId
  readonly hash: string
  readonly preferences: ChatPreferences
  readonly texts: BotTexts
}

/**
 * The Telegram front door: language and country choice, menu, help numbers,
 * rights, and free-text questions answered by the assistant. Only a salted
 * hash of the chat id and the chosen locale/country are stored.
 */
export class BotService extends Context.Service<
  BotService,
  {
    /** Never fails: errors are logged (without message content) so Telegram does not retry. */
    handleUpdate(update: TelegramUpdate): Effect.Effect<void>
  }
>()("@dadalink/core/BotService") {
  static readonly layer = Layer.effect(
    BotService,
    Effect.gen(function* () {
      const bot = yield* MessengerBot
      const preferencesRepo = yield* ChatPreferencesRepo
      const pseudonymizer = yield* Pseudonymizer
      const assistant = yield* Assistant
      const directory = yield* HelpDirectory
      const catalog = yield* ContentCatalog
      const settings = yield* BotSettings

      const loadChat = Effect.fn("BotService.loadChat")(function* (id: TelegramChatId, languageCode?: string) {
        const hash = yield* pseudonymizer.hash("telegram-chat", String(id))
        const stored = yield* preferencesRepo.get(hash)
        const preferences = Option.getOrElse(stored, () => ({ locale: localeFromLanguageCode(languageCode) }))
        if (Option.isNone(stored)) yield* preferencesRepo.set(hash, preferences)
        return { id, hash, preferences, texts: BOT_TEXTS[preferences.locale] } satisfies Chat
      })

      const updatePreferences = (chat: Chat, preferences: ChatPreferences) =>
        preferencesRepo
          .set(chat.hash, preferences)
          .pipe(Effect.as({ ...chat, preferences, texts: BOT_TEXTS[preferences.locale] } satisfies Chat))

      const say = (chat: Chat, text: string, buttons?: ReadonlyArray<ReadonlyArray<InlineButton>>) =>
        bot.sendMessage({ chatId: chat.id, text: clip(text), ...(buttons === undefined ? {} : { buttons }) })

      const showMenu = (chat: Chat) => say(chat, chat.texts.menu, menuKeyboard(chat.texts, settings.appUrl))
      const askCountry = (chat: Chat) => say(chat, chat.texts.chooseCountry, countryKeyboard(chat.texts))

      const showHelp = Effect.fn("BotService.showHelp")(function* (chat: Chat) {
        const country = chat.preferences.country
        if (country === undefined) return yield* askCountry(chat)
        const entries = yield* directory.forCountry(country)
        yield* say(chat, formatHelpNumbers(entries, country, chat.preferences.locale, chat.texts))
      })

      const showRights = Effect.fn("BotService.showRights")(function* (chat: Chat) {
        const country = chat.preferences.country
        if (country === undefined) return yield* askCountry(chat)
        const locale = chat.preferences.locale
        const rights = yield* catalog.list({ locale, country, kind: "rights" })
        const related = yield* catalog.list({ locale, country, phase: "abroad", topic: "rights" })
        const items = [...rights, ...related.filter((r) => !rights.some((x) => x.id === r.id))].slice(
          0,
          MAX_RIGHTS_ITEMS
        )
        const text =
          items.length === 0
            ? chat.texts.noRights
            : `${chat.texts.rightsTitle} (${chat.texts.countries[country]})\n\n${items.map((i) => `• ${i.title}\n  ${i.summary}`).join("\n\n")}`
        yield* say(chat, text, [[{ text: chat.texts.buttons.ask, callbackData: "menu:ask" }]])
      })

      const answer = Effect.fn("BotService.answer")(function* (chat: Chat, question: string) {
        const response = yield* assistant
          .askAs(
            { namespace: "telegram-chat", id: String(chat.id) },
            {
              locale: chat.preferences.locale,
              question,
              ...(chat.preferences.country === undefined ? {} : { country: chat.preferences.country })
            }
          )
          .pipe(
            Effect.map((r) => ({ text: r.answer, emergency: r.emergency !== null })),
            Effect.catchTags({
              RateLimited: () => Effect.succeed({ text: chat.texts.rateLimited, emergency: false }),
              UpstreamUnavailable: () => Effect.succeed({ text: chat.texts.unavailable, emergency: false })
            })
          )
        yield* say(chat, response.text, response.emergency ? helpButton(chat.texts) : undefined)
      })

      const perform = (chat: Chat, action: BotAction) => {
        switch (action._tag) {
          case "Start":
            return say(chat, `${chat.texts.welcome}\n\n${chat.texts.chooseLanguage}`, languageKeyboard())
          case "SetLanguage":
            return updatePreferences(chat, { ...chat.preferences, locale: action.locale }).pipe(
              Effect.flatMap((updated) =>
                updated.preferences.country === undefined ? askCountry(updated) : showMenu(updated)
              )
            )
          case "SetCountry":
            return updatePreferences(chat, { ...chat.preferences, country: action.country }).pipe(
              Effect.flatMap(showMenu)
            )
          case "Question":
            return answer(chat, action.text)
          case "Menu":
            switch (action.item) {
              case "main":
                return showMenu(chat)
              case "ask":
                return say(chat, chat.texts.askPrompt)
              case "help":
                return showHelp(chat)
              case "rights":
                return showRights(chat)
              case "language":
                return say(chat, chat.texts.chooseLanguage, languageKeyboard())
              case "country":
                return askCountry(chat)
              case "sos":
                return say(chat, chat.texts.sosInfo, helpButton(chat.texts))
            }
        }
      }

      const handleMessage = Effect.fn("BotService.handleMessage")(function* (
        message: NonNullable<TelegramUpdate["message"]>
      ) {
        const chat = yield* loadChat(message.chat.id, message.from?.language_code)
        const action = message.text === undefined ? undefined : parseText(message.text)
        yield* perform(chat, action ?? { _tag: "Menu", item: "main" })
      })

      const handleCallback = Effect.fn("BotService.handleCallback")(function* (
        query: NonNullable<TelegramUpdate["callback_query"]>
      ) {
        yield* bot.answerCallback(query.id)
        const chatId = query.message?.chat.id
        const action = query.data === undefined ? undefined : parseCallbackData(query.data)
        if (chatId === undefined || action === undefined) return
        const chat = yield* loadChat(chatId, query.from?.language_code)
        yield* perform(chat, action)
      })

      const handleUpdate = (update: TelegramUpdate): Effect.Effect<void> =>
        Effect.gen(function* () {
          if (update.callback_query !== undefined) yield* handleCallback(update.callback_query)
          else if (update.message !== undefined) yield* handleMessage(update.message)
        }).pipe(
          Effect.catchCause((cause) =>
            Effect.logError("Telegram update failed").pipe(
              Effect.annotateLogs({ updateId: update.update_id, cause: String(cause) })
            )
          ),
          Effect.withSpan("BotService.handleUpdate")
        )

      return BotService.of({ handleUpdate })
    })
  )
}
