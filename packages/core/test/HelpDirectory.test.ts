import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { HelpDirectory } from "../src/index.ts"
import { SeededCatalog } from "./seed.ts"

const TestLayer = HelpDirectory.layer.pipe(Layer.provideMerge(SeededCatalog))

describe("HelpDirectory", () => {
  it.effect("lists a country's entries in curated order", () =>
    Effect.gen(function* () {
      const entries = yield* (yield* HelpDirectory).forCountry("SA")
      expect(entries.map((e) => e.id)).toEqual(["sa-police", "sa-ambulance", "sa-ethiopian-embassy"])
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect("derives emergency contacts with dialable numbers, localised names first", () =>
    Effect.gen(function* () {
      const contacts = yield* (yield* HelpDirectory).emergencyContacts("SA", "am")
      expect(contacts.map((c) => [c.name, c.phone])).toEqual([
        ["ፖሊስ", "999"],
        ["Ambulance (Red Crescent)", "997"]
      ])
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect("returns an empty list for a country without entries", () =>
    Effect.gen(function* () {
      expect(yield* (yield* HelpDirectory).emergencyContacts("QA", "en")).toEqual([])
    }).pipe(Effect.provide(TestLayer))
  )
})
