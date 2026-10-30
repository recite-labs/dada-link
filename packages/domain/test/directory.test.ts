import { describe, expect, it } from "@effect/vitest"
import { Schema } from "effect"
import { DirectoryEntry, dialableNumber, PhoneNumber, ShortCode } from "../src/index.ts"

const entry = {
  id: "sa-police",
  country: "SA",
  kind: "police",
  name: "Police",
  names: { am: "ፖሊስ" },
  phone: "999",
  emergency: true,
  sourceUrl: "https://www.my.gov.sa/",
  verified: false
}

describe("DirectoryEntry", () => {
  it("decodes a minimal entry and applies defaults for optional fields", () => {
    const decoded = Schema.decodeUnknownSync(DirectoryEntry)(entry)
    expect(decoded.phone).toBe("999")
    expect(decoded.names.am).toBe("ፖሊስ")
    expect(decoded.whatsapp).toBeUndefined()
  })

  it("allows a null phone (number not yet verified) and rejects invented formats", () => {
    expect(Schema.decodeUnknownSync(DirectoryEntry)({ ...entry, phone: null }).phone).toBeNull()
    expect(() => Schema.decodeUnknownSync(DirectoryEntry)({ ...entry, phone: "call me" })).toThrow()
  })

  it("rejects unknown kinds", () => {
    expect(() => Schema.decodeUnknownSync(DirectoryEntry)({ ...entry, kind: "pizza" })).toThrow()
  })
})

describe("PhoneNumber", () => {
  it("accepts short codes and international numbers", () => {
    for (const p of ["911", "+966 11 482 3919", "+251-11-551-7055", "8001240200"]) {
      expect(Schema.decodeUnknownSync(PhoneNumber)(p)).toBe(p)
    }
  })
})

describe("short codes", () => {
  it("accepts 2 to 8 digit local numbers only", () => {
    expect(Schema.decodeUnknownSync(ShortCode)("999")).toBe("999")
    expect(() => Schema.decodeUnknownSync(ShortCode)("+966")).toThrow()
    expect(() => Schema.decodeUnknownSync(ShortCode)("123456789")).toThrow()
  })

  it("prefers the short code as the dialable number", () => {
    const e = Schema.decodeUnknownSync(DirectoryEntry)({
      ...entry,
      phone: "+966112345678",
      shortCode: "999",
      kind: "helpline"
    })
    expect(dialableNumber(e)).toBe("999")
    expect(dialableNumber({ phone: "+966112345678", shortCode: null })).toBe("+966112345678")
    expect(e.helpsWith).toEqual([])
  })
})
