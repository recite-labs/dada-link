import { describe, expect, it } from "@effect/vitest"
import { Schema } from "effect"
import { AskRequest, GeoLocation, SosRequest } from "../src/index.ts"

const deviceId = "6f1c1d2e-8a3b-4c5d-9e6f-7a8b9c0d1e2f"

describe("AskRequest", () => {
  it("decodes a question with locale and optional country", () => {
    const r = Schema.decodeUnknownSync(AskRequest)({ deviceId, locale: "am", question: "ደሞዜ አልተከፈለኝም" })
    expect(r.country).toBeUndefined()
  })

  it("rejects empty and over-long questions", () => {
    expect(() => Schema.decodeUnknownSync(AskRequest)({ deviceId, locale: "en", question: "   " })).toThrow()
    expect(() => Schema.decodeUnknownSync(AskRequest)({ deviceId, locale: "en", question: "x".repeat(2001) })).toThrow()
  })
})

describe("GeoLocation", () => {
  it("validates coordinate ranges", () => {
    expect(Schema.decodeUnknownSync(GeoLocation)({ latitude: 24.7, longitude: 46.7 }).latitude).toBe(24.7)
    expect(() => Schema.decodeUnknownSync(GeoLocation)({ latitude: 91, longitude: 0 })).toThrow()
    expect(() => Schema.decodeUnknownSync(GeoLocation)({ latitude: 0, longitude: -181 })).toThrow()
  })
})

describe("SosRequest", () => {
  it("requires at least one delivery channel for the trusted contact", () => {
    expect(() => Schema.decodeUnknownSync(SosRequest)({ deviceId, locale: "en", trustedContact: {} })).toThrow()
    const ok = Schema.decodeUnknownSync(SosRequest)({
      deviceId,
      locale: "en",
      trustedContact: { phone: "+251911000000" }
    })
    expect(ok.trustedContact.phone).toBe("+251911000000")
  })

  it("requires an international phone number for SMS", () => {
    expect(() =>
      Schema.decodeUnknownSync(SosRequest)({ deviceId, locale: "en", trustedContact: { phone: "0911000000" } })
    ).toThrow()
  })

  it("limits the free-text message length", () => {
    expect(() =>
      Schema.decodeUnknownSync(SosRequest)({
        deviceId,
        locale: "en",
        trustedContact: { telegramChatId: 1 },
        message: "x".repeat(501)
      })
    ).toThrow()
  })
})
