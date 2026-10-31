import { describe, expect, it } from "@effect/vitest"
import { expandSearchTerms, MAX_EXPANDED_TERMS, queryTerms, SEARCH_SYNONYMS, searchTerms } from "../src/index.ts"

describe("searchTerms", () => {
  it("extracts lower-cased unique word terms and drops punctuation and 1-char tokens", () => {
    expect(searchTerms('My salary, my "SALARY" a NEAR(x)!')).toEqual(["my", "salary", "near"])
  })

  it("keeps Ethiopic words", () => {
    expect(searchTerms("ደሞዜ አልተከፈለኝም።")).toEqual(["ደሞዜ", "አልተከፈለኝም"])
  })

  it("returns nothing for blank input", () => {
    expect(searchTerms("   ")).toEqual([])
  })
})

describe("expandSearchTerms", () => {
  it("keeps the original terms first and in order", () => {
    const expanded = expandSearchTerms(["how", "legal", "agency"])
    expect(expanded.slice(0, 3)).toEqual(["how", "legal", "agency"])
  })

  it("maps legal to licence / licence spellings / registered / authorised", () => {
    const expanded = expandSearchTerms(["legal"])
    expect(expanded).toEqual(expect.arrayContaining(["licen", "regist", "authoris", "authoriz"]))
  })

  it("maps agency to agent, broker and recruiter (both directions)", () => {
    expect(expandSearchTerms(["agency"])).toEqual(expect.arrayContaining(["agent", "broker", "recruit"]))
    expect(expandSearchTerms(["brokers"])).toEqual(expect.arrayContaining(["agenc"]))
    expect(expandSearchTerms(["recruitment"])).toEqual(expect.arrayContaining(["agenc", "broker"]))
  })

  it("maps illegal, licensed and unlicensed into the legality group", () => {
    for (const term of ["illegal", "licensed", "unlicensed", "registered"])
      expect(expandSearchTerms([term])).toEqual(expect.arrayContaining(["legal", "licen"]))
  })

  it("maps passport to documents and salary to wages and pay", () => {
    expect(expandSearchTerms(["passport"])).toEqual(expect.arrayContaining(["document"]))
    expect(expandSearchTerms(["salary"])).toEqual(expect.arrayContaining(["wage", "pay"]))
    expect(expandSearchTerms(["wages"])).toEqual(expect.arrayContaining(["salar"]))
  })

  it("expands inflected Amharic words, including after a prepositional prefix", () => {
    expect(expandSearchTerms(["ኤጀንሲዬ"])).toEqual(expect.arrayContaining(["ኤጀንሲ", "ደላላ", "ደላሎ"]))
    expect(expandSearchTerms(["ለደላላው"])).toEqual(expect.arrayContaining(["ኤጀንሲ"]))
    expect(expandSearchTerms(["ሕጋዊ"])).toEqual(expect.arrayContaining(["ፈቃድ", "ሕገወጥ"]))
    expect(expandSearchTerms(["ደሞዜ"])).toEqual(expect.arrayContaining(["ደመወዝ"]))
  })

  it("expands Afaan Oromo spelling variants", () => {
    expect(expandSearchTerms(["ejensiin"])).toEqual(expect.arrayContaining(["ejans", "deelaal", "delaal"]))
    expect(expandSearchTerms(["seeraan"])).toEqual(expect.arrayContaining(["hayyam"]))
  })

  it("does not treat Oromo verb endings in -eera as 'law'", () => {
    expect(expandSearchTerms(["gabaaseera"])).toEqual(["gabaaseera"])
  })

  it("leaves unrelated terms alone and de-duplicates", () => {
    expect(expandSearchTerms(["hello", "world", "hello"])).toEqual(["hello", "world"])
    expect(expandSearchTerms([])).toEqual([])
  })

  it("caps the number of terms", () => {
    const many = SEARCH_SYNONYMS.flat()
    expect(expandSearchTerms(many).length).toBeLessThanOrEqual(MAX_EXPANDED_TERMS)
  })

  it("only uses lower-case, NFKC-normalised stems that searchTerms would produce", () => {
    for (const stem of SEARCH_SYNONYMS.flat()) expect(searchTerms(stem)).toEqual([stem])
  })
})

describe("queryTerms", () => {
  it("tokenises then expands", () => {
    const terms = queryTerms("How do I know if my agency is legal?")
    expect(terms).toEqual(expect.arrayContaining(["agency", "legal", "licen", "broker"]))
  })
})
