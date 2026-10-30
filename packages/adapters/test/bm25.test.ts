import { describe, expect, it } from "@effect/vitest"
import { Bm25Index } from "../src/index.ts"

const docs = [
  { id: "a", fields: { title: "Salary not paid", body: "If your salary is late, write it down." } },
  { id: "b", fields: { title: "Passport", body: "Your employer may not keep your passport." } },
  { id: "c", fields: { title: "Rest day", body: "You have the right to a weekly rest day and salary." } }
]
const weights = { title: 5, body: 1 }

describe("Bm25Index", () => {
  it("ranks documents with matches in heavily weighted fields first", () => {
    const ranked = Bm25Index.make(docs, weights).search(["salary"])
    expect(ranked.map((r) => r.id)).toEqual(["a", "c"])
    expect(ranked[0]?.score).toBeGreaterThan(ranked[1]?.score ?? 0)
  })

  it("matches prefixes for longer terms", () => {
    expect(
      Bm25Index.make(docs, weights)
        .search(["passp"])
        .map((r) => r.id)
    ).toEqual(["b"])
  })

  it("returns nothing when no term matches", () => {
    expect(Bm25Index.make(docs, weights).search(["zzz"])).toEqual([])
    expect(Bm25Index.make([], weights).search(["salary"])).toEqual([])
  })
})
