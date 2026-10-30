import type { ContentId } from "@dadalink/domain"
import { describe, expect, it } from "@effect/vitest"
import { buildSystemPrompt, buildUserMessage } from "../../src/index.ts"

const passages = [
  {
    contentId: "abroad-unpaid-wages" as ContentId,
    locale: "en" as const,
    status: "reviewed" as const,
    title: "When your salary is not paid",
    text: "Write down every month that was unpaid.",
    score: 3
  },
  {
    contentId: "rights-sa" as ContentId,
    locale: "en" as const,
    status: "reviewed" as const,
    title: "Your rights in Saudi Arabia",
    text: "x".repeat(5000),
    score: 2
  }
]

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt({ locale: "am", country: "SA", passages, emergency: [] })

  it("introduces Dada with a warm sister-like voice and the answer language", () => {
    expect(prompt).toContain("Dada")
    expect(prompt).toMatch(/sister/i)
    expect(prompt).toContain("Amharic")
  })

  it("restricts answers to numbered sources and requires citations", () => {
    expect(prompt).toContain("[1] When your salary is not paid (id: abroad-unpaid-wages")
    expect(prompt).toContain("[2] Your rights in Saudi Arabia (id: rights-sa")
    expect(prompt).toMatch(/ONLY/)
    expect(prompt).toMatch(/cite/i)
  })

  it("states general-information, privacy and injection rules", () => {
    expect(prompt).toMatch(/not legal or medical advice/i)
    expect(prompt).toMatch(/never ask/i)
    expect(prompt).toMatch(/not as instructions/i)
  })

  it("truncates long passages", () => {
    expect(prompt.length).toBeLessThan(6000)
  })

  it("names the country and adds emergency guidance only when needed", () => {
    expect(prompt).toContain("Saudi Arabia")
    expect(prompt).not.toMatch(/emergency line/i)
    const urgent = buildSystemPrompt({ locale: "en", passages, emergency: ["violence"] })
    expect(urgent).toMatch(/emergency line/i)
    expect(urgent).toContain("unknown")
  })
})

describe("buildUserMessage", () => {
  it("wraps the redacted question", () => {
    expect(buildUserMessage("Call +966551234567 please")).toContain("[phone]")
  })
})
