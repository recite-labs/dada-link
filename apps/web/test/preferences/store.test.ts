import { describe, expect, it, vi } from "vitest"
import { createPreferenceStore, selectJourney } from "../../src/preferences/index.ts"

describe("preference store", () => {
  it("starts abroad in Saudi Arabia with no saved language", () => {
    expect(createPreferenceStore(window.localStorage).get()).toEqual({
      locale: undefined,
      country: "SA",
      journey: "abroad"
    })
  })

  it("persists language, country and journey only", () => {
    const store = createPreferenceStore(window.localStorage)
    store.update({ locale: "om", country: "LB", journey: "before" })
    expect(createPreferenceStore(window.localStorage).get()).toEqual({ locale: "om", country: "LB", journey: "before" })
    expect(Object.keys(window.localStorage).sort()).toEqual(["dadalink.country", "dadalink.journey", "dadalink.locale"])
  })

  it("ignores tampered values", () => {
    window.localStorage.setItem("dadalink.country", "US")
    window.localStorage.setItem("dadalink.locale", "fr")
    expect(createPreferenceStore(window.localStorage).get()).toMatchObject({ locale: undefined, country: "SA" })
  })

  it("notifies subscribers only on real changes", () => {
    const store = createPreferenceStore(window.localStorage)
    const listener = vi.fn()
    store.subscribe(listener)
    store.update({ country: "QA" })
    store.update({ country: "QA" })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("keeps working in memory when storage throws (private mode)", () => {
    const broken = {
      getItem: () => {
        throw new Error("SecurityError")
      },
      setItem: () => {
        throw new Error("QuotaExceededError")
      }
    } as unknown as Storage
    const store = createPreferenceStore(broken)
    store.update({ country: "JO" })
    expect(store.get().country).toBe("JO")
  })

  it("creates one random device id and reuses it", () => {
    const random = vi.fn(() => "0b6c6b1e-0d55-4e8e-9f3a-2f7a1c9d8e01")
    const store = createPreferenceStore(window.localStorage, random)
    expect(store.deviceId()).toBe("0b6c6b1e-0d55-4e8e-9f3a-2f7a1c9d8e01")
    expect(createPreferenceStore(window.localStorage, random).deviceId()).toBe("0b6c6b1e-0d55-4e8e-9f3a-2f7a1c9d8e01")
    expect(random).toHaveBeenCalledTimes(1)
  })
})

describe("selectJourney", () => {
  it("selects Ethiopia when coming home", () => {
    expect(selectJourney({ journey: "abroad", country: "KW" }, "return")).toEqual({ journey: "return", country: "ET" })
  })

  it("keeps the destination between before and abroad", () => {
    expect(selectJourney({ journey: "abroad", country: "KW" }, "before")).toEqual({ journey: "before", country: "KW" })
  })

  it("leaves Ethiopia for a destination when going abroad again", () => {
    expect(selectJourney({ journey: "return", country: "ET" }, "abroad")).toEqual({ journey: "abroad", country: "SA" })
  })
})
