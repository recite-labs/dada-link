import { describe, expect, it } from "@effect/vitest"
import { redactIdentifiers } from "../../src/index.ts"

describe("redactIdentifiers", () => {
  it("removes phone numbers, e-mail addresses and long id numbers", () => {
    const text = "Call me on +966 55 123 4567 or 0911223344, mail amina@example.com, passport EP1234567"
    const redacted = redactIdentifiers(text)
    expect(redacted).not.toMatch(/\d{4}/)
    expect(redacted).not.toContain("amina@example.com")
    expect(redacted).toContain("[phone]")
    expect(redacted).toContain("[email]")
    expect(redacted).toContain("[number]")
  })

  it("keeps ordinary text and short numbers (ages, months, amounts)", () => {
    expect(redactIdentifiers("I am 22 and was not paid for 3 months (1200 riyal)")).toBe(
      "I am 22 and was not paid for 3 months (1200 riyal)"
    )
  })
})
