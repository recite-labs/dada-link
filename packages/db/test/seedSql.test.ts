import { ContentItem } from "@dadalink/domain"
import { AgencyRepo, ContentRepo, DirectoryRepo, Retriever } from "@dadalink/ports"
import { agencies, allContent, lbDirectory, saDirectory } from "@dadalink/testing"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Schema } from "effect"
import { catalogSeedSql, catalogSeedStatements, Database, sqlLiteral } from "../src/index.ts"
import { makeSqliteTestLayer } from "./layers.ts"

/** Body with newlines, quotes and a question mark: the tricky cases for inlined SQL. */
const tricky = Schema.decodeUnknownSync(ContentItem)({
  id: "tricky-body",
  kind: "article",
  phase: null,
  countries: [],
  topics: ["health"],
  sources: [],
  translations: [
    {
      locale: "en",
      status: "reviewed",
      title: "It's tricky?",
      summary: "Line one",
      body: "Line one\n\nIt's line two?\n- item"
    }
  ]
})

const input = {
  items: [...allContent, tricky],
  directory: [
    { country: "SA" as const, entries: saDirectory },
    { country: "LB" as const, entries: lbDirectory }
  ],
  agencies
}

describe("sqlLiteral", () => {
  it("renders SQL literals safely", () => {
    expect(sqlLiteral(null)).toBe("NULL")
    expect(sqlLiteral(42)).toBe("42")
    expect(sqlLiteral(true)).toBe("1")
    expect(sqlLiteral("it's")).toBe("'it''s'")
    expect(() => sqlLiteral(Number.NaN)).toThrow()
  })
})

describe("catalogSeedSql", () => {
  it.effect("produces SQL that, replayed on a migrated database, yields the same catalogue as the CatalogWriter", () =>
    Effect.gen(function* () {
      const script = yield* catalogSeedSql(input)
      expect(script.startsWith("-- Generated")).toBe(true)
      const db = yield* Database
      for (const statement of yield* catalogSeedStatements(input)) yield* db.run(statement)

      const items = yield* (yield* ContentRepo).list({})
      expect(items.map((i) => i.id).toSorted()).toEqual([...allContent, tricky].map((i) => i.id).toSorted())
      expect(items.find((i) => i.id === "tricky-body")?.translations[0]?.body).toBe(
        "Line one\n\nIt's line two?\n- item"
      )
      expect(yield* (yield* DirectoryRepo).listByCountry("SA")).toEqual(saDirectory)
      expect((yield* (yield* AgencyRepo).searchByName("selam", 5)).map((a) => a.id)).toEqual(["et-agency-001"])
      const passages = yield* (yield* Retriever).retrieve({
        text: "salary",
        locale: "en",
        limit: 2,
        reviewedOnly: false
      })
      expect(passages[0]?.contentId).toBe("abroad-unpaid-wages")
    }).pipe(Effect.provide(makeSqliteTestLayer()))
  )
})
