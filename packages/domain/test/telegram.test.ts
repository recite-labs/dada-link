import { describe, expect, it } from "@effect/vitest"
import { Schema } from "effect"
import { TelegramUpdate } from "../src/index.ts"

describe("TelegramUpdate", () => {
  it("decodes a text message and ignores unknown fields", () => {
    const update = Schema.decodeUnknownSync(TelegramUpdate)({
      update_id: 10,
      message: {
        message_id: 1,
        date: 1730000000,
        chat: { id: 123, type: "private", first_name: "ignored" },
        from: { id: 123, is_bot: false, language_code: "am" },
        text: "/start"
      }
    })
    expect(update.message?.text).toBe("/start")
    expect(update.message?.from?.language_code).toBe("am")
    expect(update.message?.chat).toEqual({ id: 123 })
  })

  it("decodes callback queries and updates we do not handle", () => {
    const callback = Schema.decodeUnknownSync(TelegramUpdate)({
      update_id: 11,
      callback_query: { id: "cb1", data: "lang:om", message: { message_id: 5, chat: { id: 123 } } }
    })
    expect(callback.callback_query?.data).toBe("lang:om")
    const edited = Schema.decodeUnknownSync(TelegramUpdate)({ update_id: 12, edited_message: { text: "x" } })
    expect(edited.message).toBeUndefined()
  })

  it("rejects payloads without an update id", () => {
    expect(() => Schema.decodeUnknownSync(TelegramUpdate)({ message: {} })).toThrow()
  })
})
