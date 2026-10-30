import { describe, expect, it } from "vitest"
import { groupDirectory } from "../../src/features/help/groupDirectory.ts"
import { DIRECTORY_FIXTURES, directoryEntry } from "../fixtures.ts"

describe("groupDirectory", () => {
  it("orders groups by need with emergency first and drops empty groups", () => {
    expect(groupDirectory(DIRECTORY_FIXTURES).map((section) => section.group)).toEqual([
      "emergency",
      "missions",
      "work",
      "support"
    ])
  })

  it("keeps the reviewed file order inside a group", () => {
    const emergency = groupDirectory(DIRECTORY_FIXTURES)[0]
    expect(emergency?.entries.map((entry) => entry.id)).toEqual(["sa-police", "sa-ambulance"])
  })

  it("files every kind somewhere", () => {
    const kinds = [
      "fire",
      "iom",
      "un-agency",
      "legal-aid",
      "helpline",
      "mental-health",
      "returnee-service",
      "other"
    ] as const
    const entries = kinds.map((kind) => directoryEntry({ id: `x-${kind}`, kind }))
    const grouped = groupDirectory(entries).flatMap((section) => section.entries)
    expect(grouped).toHaveLength(kinds.length)
  })

  it("returns nothing for an empty directory", () => {
    expect(groupDirectory([])).toEqual([])
  })
})
