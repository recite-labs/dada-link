import { describe, expect, it } from "@effect/vitest"
import { Schema } from "effect"
import { Agency, normalizeAgencyName, normalizeLicence } from "../src/index.ts"

describe("Agency", () => {
  it("decodes a licensed agency", () => {
    const a = Schema.decodeUnknownSync(Agency)({
      id: "et-agency-001",
      name: "Example Overseas Employment Agency PLC",
      licenceNumber: "MoLS/123/2024",
      status: "licensed",
      sourceUrl: "https://mols.gov.et/"
    })
    expect(a.status).toBe("licensed")
    expect(a.licenceNumber).toBe("MoLS/123/2024")
  })

  it("rejects unknown statuses", () => {
    expect(() =>
      Schema.decodeUnknownSync(Agency)({
        id: "x",
        name: "x",
        licenceNumber: null,
        status: "probably-fine",
        sourceUrl: "https://mols.gov.et/"
      })
    ).toThrow()
  })
})

describe("normalisation", () => {
  it("normalises agency names: case, punctuation, legal suffixes and whitespace", () => {
    expect(normalizeAgencyName("  Example  Overseas Employment Agency P.L.C. ")).toBe(
      "example overseas employment agency"
    )
    expect(normalizeAgencyName("ABC Foreign Employment Agent PLC")).toBe(
      normalizeAgencyName("abc foreign employment agent")
    )
  })

  it("keeps Ethiopic letters", () => {
    expect(normalizeAgencyName("አበበ  ኤጀንሲ")).toBe("አበበ ኤጀንሲ")
  })

  it("normalises licence numbers to upper-case alphanumerics", () => {
    expect(normalizeLicence(" mols/123-2024 ")).toBe("MOLS1232024")
  })
})
