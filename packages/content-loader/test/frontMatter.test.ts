import { describe, expect, it } from "@effect/vitest"
import { splitFrontMatter } from "../src/index.ts"

describe("splitFrontMatter", () => {
  it("separates YAML front matter from the Markdown body", () => {
    expect(splitFrontMatter("---\nid: x\n---\n\n# Body\n")).toEqual({ frontMatter: "id: x", body: "# Body" })
  })

  it("handles Windows line endings", () => {
    expect(splitFrontMatter("---\r\nid: x\r\n---\r\nBody")).toEqual({ frontMatter: "id: x", body: "Body" })
  })

  it("returns undefined without front matter", () => {
    expect(splitFrontMatter("# Just markdown")).toBeUndefined()
    expect(splitFrontMatter("---\nid: x\nno closing fence")).toBeUndefined()
  })
})
