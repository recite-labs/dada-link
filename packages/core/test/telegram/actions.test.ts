import { describe, expect, it } from "@effect/vitest"
import { localeFromLanguageCode, parseCallbackData, parseText } from "../../src/index.ts"

describe("bot actions", () => {
  it("parses commands, including the @BotName suffix used in groups", () => {
    expect(parseText("/start")).toEqual({ _tag: "Start" })
    expect(parseText("/help@DadaLinkBot")).toEqual({ _tag: "Menu", item: "help" })
    expect(parseText("/unknown")).toEqual({ _tag: "Menu", item: "main" })
  })

  it("treats other text as a question and ignores blank text", () => {
    expect(parseText("  Is it legal to keep my passport? ")).toEqual({
      _tag: "Question",
      text: "Is it legal to keep my passport?"
    })
    expect(parseText("   ")).toBeUndefined()
  })

  it("parses only well-formed callback data", () => {
    expect(parseCallbackData("lang:ti")).toEqual({ _tag: "SetLanguage", locale: "ti" })
    expect(parseCallbackData("country:QA")).toEqual({ _tag: "SetCountry", country: "QA" })
    expect(parseCallbackData("menu:rights")).toEqual({ _tag: "Menu", item: "rights" })
    expect(parseCallbackData("lang:fr")).toBeUndefined()
    expect(parseCallbackData("country:US")).toBeUndefined()
    expect(parseCallbackData("nonsense")).toBeUndefined()
  })

  it("maps Telegram language codes to supported locales", () => {
    expect(localeFromLanguageCode("am")).toBe("am")
    expect(localeFromLanguageCode("sw-KE")).toBe("sw")
    expect(localeFromLanguageCode("ar")).toBe("en")
    expect(localeFromLanguageCode(undefined)).toBe("en")
  })
})
