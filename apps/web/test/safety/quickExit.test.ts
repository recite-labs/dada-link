import { describe, expect, it, vi } from "vitest"
import { quickExit } from "../../src/safety/quickExit.ts"

const deps = () => {
  const calls: Array<string> = []
  return {
    calls,
    deps: {
      cleanups: [() => calls.push("forget chat"), () => calls.push("clear cache")],
      history: { replaceState: vi.fn(() => calls.push("replace history")) },
      location: { replace: vi.fn((url: string) => calls.push(`go ${url}`)) },
      sessionStorage: { clear: vi.fn(() => calls.push("clear session")) },
      neutralUrl: "https://www.bbc.com/weather"
    }
  }
}

describe("quickExit", () => {
  it("forgets state, rewrites the history entry, then replaces the page", () => {
    const { calls, deps: d } = deps()
    quickExit(d)
    expect(calls).toEqual([
      "forget chat",
      "clear cache",
      "clear session",
      "replace history",
      "go https://www.bbc.com/weather"
    ])
    expect(d.history.replaceState).toHaveBeenCalledWith(null, "", "/")
  })

  it("still leaves when a cleanup or history fails", () => {
    const { deps: d } = deps()
    quickExit({
      ...d,
      cleanups: [
        () => {
          throw new Error("boom")
        }
      ],
      history: {
        replaceState: () => {
          throw new Error("SecurityError")
        }
      }
    })
    expect(d.location.replace).toHaveBeenCalledWith("https://www.bbc.com/weather")
  })
})
