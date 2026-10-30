import {
  AnsweredCallbacks,
  FakeLanguageModel,
  MemoryChatPreferences,
  MemoryRateLimiter,
  RecordingMessengerBot,
  SentMessages
} from "@dadalink/adapters"
import { TelegramUpdate } from "@dadalink/domain"
import { ChatPreferencesRepo, type InlineButton, type OutgoingMessage } from "@dadalink/ports"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Option, Redacted, Ref, Schema } from "effect"
import {
  Assistant,
  AssistantSettings,
  BotService,
  BotSettings,
  ContentCatalog,
  HelpDirectory,
  Pseudonymizer
} from "../../src/index.ts"
import { SeededCatalog } from "../seed.ts"

const CHAT = 5550001

const makeLayer = (options: { readonly dailyLimit?: number } = {}) =>
  BotService.layer.pipe(
    Layer.provide(Assistant.layer),
    Layer.provide(Layer.mergeAll(HelpDirectory.layer, ContentCatalog.layer)),
    Layer.provide(FakeLanguageModel.layer()),
    Layer.provide(
      AssistantSettings.layer({ reviewedOnly: false, dailyLimit: options.dailyLimit ?? 10, maxPassages: 3 })
    ),
    Layer.provide(MemoryRateLimiter.layer),
    Layer.provide(BotSettings.layer({ appUrl: "https://example.org/app" })),
    Layer.provideMerge(Pseudonymizer.layer(Redacted.make("bot-salt"))),
    Layer.provideMerge(MemoryChatPreferences.layer),
    Layer.provideMerge(RecordingMessengerBot.layer()),
    Layer.provideMerge(SeededCatalog)
  )

const update = (fields: Record<string, unknown>) =>
  Schema.decodeUnknownSync(TelegramUpdate)({ update_id: 1, ...fields })
const text = (value: string, languageCode = "en") =>
  update({ message: { message_id: 1, chat: { id: CHAT }, from: { language_code: languageCode }, text: value } })
const callback = (data: string) =>
  update({ callback_query: { id: `cb-${data}`, data, message: { chat: { id: CHAT } } } })

const handle = (u: TelegramUpdate) =>
  Effect.gen(function* () {
    yield* (yield* BotService).handleUpdate(u)
  })

const sent = Effect.gen(function* () {
  return yield* Ref.get(yield* SentMessages)
})
const last = Effect.map(sent, (all): OutgoingMessage | undefined => all.at(-1))
const callbacks = (message: OutgoingMessage | undefined) =>
  (message?.buttons ?? []).flat().flatMap((b: InlineButton) => ("callbackData" in b ? [b.callbackData] : []))

const setPrefs = (prefs: { readonly locale: "en" | "am" | "om"; readonly country?: "SA" | "LB" }) =>
  Effect.gen(function* () {
    const hash = yield* (yield* Pseudonymizer).hash("telegram-chat", String(CHAT))
    yield* (yield* ChatPreferencesRepo).set(hash, prefs)
  })

describe("BotService", () => {
  it.effect("/start greets in the user's Telegram language and offers language choices", () =>
    Effect.gen(function* () {
      yield* handle(text("/start", "am"))
      const message = yield* last
      expect(message?.chatId).toBe(CHAT)
      expect(message?.text).toMatch(/[ሀ-፿]/u)
      expect(callbacks(message)).toEqual(
        expect.arrayContaining(["lang:am", "lang:om", "lang:en", "lang:sw", "lang:ti"])
      )
    }).pipe(Effect.provide(makeLayer()))
  )

  it.effect("stores preferences under a salted hash, never the raw chat id", () =>
    Effect.gen(function* () {
      yield* handle(text("/start", "om"))
      const repo = yield* ChatPreferencesRepo
      expect(Option.isNone(yield* repo.get(String(CHAT)))).toBe(true)
      const hash = yield* (yield* Pseudonymizer).hash("telegram-chat", String(CHAT))
      expect(yield* repo.get(hash)).toEqual(Option.some({ locale: "om" }))
    }).pipe(Effect.provide(makeLayer()))
  )

  it.effect("choosing a language answers the callback and asks for the country", () =>
    Effect.gen(function* () {
      yield* handle(callback("lang:sw"))
      expect(yield* Ref.get(yield* AnsweredCallbacks)).toEqual(["cb-lang:sw"])
      const message = yield* last
      expect(callbacks(message)).toEqual(expect.arrayContaining(["country:SA", "country:LB", "country:ET"]))
    }).pipe(Effect.provide(makeLayer()))
  )

  it.effect("choosing a country shows the main menu with the four actions", () =>
    Effect.gen(function* () {
      yield* setPrefs({ locale: "en" })
      yield* handle(callback("country:SA"))
      const message = yield* last
      expect(callbacks(message)).toEqual(expect.arrayContaining(["menu:ask", "menu:help", "menu:rights"]))
      const urls = (message?.buttons ?? []).flat().flatMap((b) => ("url" in b ? [b.url] : []))
      expect(urls).toEqual(["https://example.org/app"])
    }).pipe(Effect.provide(makeLayer()))
  )

  it.effect("Help numbers lists the country's directory with emergency numbers first", () =>
    Effect.gen(function* () {
      yield* setPrefs({ locale: "en", country: "SA" })
      yield* handle(callback("menu:help"))
      const message = yield* last
      expect(message?.text).toContain("999")
      expect(message?.text).toContain("997")
      expect(message?.text.indexOf("999")).toBeLessThan(message?.text.indexOf("Embassy") ?? 0)
    }).pipe(Effect.provide(makeLayer()))
  )

  it.effect("Help numbers asks for the country first when unknown", () =>
    Effect.gen(function* () {
      yield* setPrefs({ locale: "en" })
      yield* handle(callback("menu:help"))
      expect(callbacks(yield* last)).toContain("country:SA")
    }).pipe(Effect.provide(makeLayer()))
  )

  it.effect("My rights lists rights content for the country", () =>
    Effect.gen(function* () {
      yield* setPrefs({ locale: "en", country: "SA" })
      yield* handle(callback("menu:rights"))
      expect((yield* last)?.text).toContain("Your rights in Saudi Arabia")
    }).pipe(Effect.provide(makeLayer()))
  )

  it.effect("free text is answered by the assistant with citations", () =>
    Effect.gen(function* () {
      yield* setPrefs({ locale: "en", country: "SA" })
      yield* handle(text("my salary was not paid"))
      expect((yield* last)?.text).toContain("[1]")
    }).pipe(Effect.provide(makeLayer()))
  )

  it.effect("danger in free text leads with SOS and local numbers", () =>
    Effect.gen(function* () {
      yield* setPrefs({ locale: "en", country: "SA" })
      yield* handle(text("my madam beats me"))
      const message = yield* last
      const firstLine = message?.text.split("\n")[0] ?? ""
      expect(firstLine).toContain("SOS")
      expect(firstLine).toContain("999")
      expect(callbacks(message)).toContain("menu:help")
    }).pipe(Effect.provide(makeLayer()))
  )

  it.effect("tells the user politely when the daily limit is reached", () =>
    Effect.gen(function* () {
      yield* setPrefs({ locale: "en" })
      yield* handle(text("salary"))
      yield* handle(text("salary"))
      expect((yield* last)?.text).toMatch(/tomorrow/i)
    }).pipe(Effect.provide(makeLayer({ dailyLimit: 1 })))
  )

  it.effect("ignores unknown callbacks and updates without content, without failing", () =>
    Effect.gen(function* () {
      yield* handle(callback("bogus:data"))
      yield* handle(update({}))
      expect(yield* Ref.get(yield* AnsweredCallbacks)).toEqual(["cb-bogus:data"])
    }).pipe(Effect.provide(makeLayer()))
  )
})
