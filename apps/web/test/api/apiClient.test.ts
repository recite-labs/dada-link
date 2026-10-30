import type { AssistantStreamEvent } from "@dadalink/domain"
import { afterEach, describe, expect, it } from "vitest"
import { ApiError, createApiClient, type DadaLinkApi, isAbortError } from "../../src/api/index.ts"
import { json, makeFakeFetch, sse } from "../fakeFetch.ts"

const BASE = "http://dadalink.test"
const DEVICE = "0b6c6b1e-0d55-4e8e-9f3a-2f7a1c9d8e01"

const summary = {
  id: "abroad-unpaid-wages",
  kind: "article",
  phase: "abroad",
  countries: [],
  topics: ["wages"],
  locale: "am",
  status: "draft-ai",
  title: "ያልተከፈለ ደመወዝ",
  summary: "ምን ማድረግ ይችላሉ",
  sensitive: false
}

let client: DadaLinkApi | undefined
const make = (fetch: typeof globalThis.fetch) => {
  client = createApiClient({ baseUrl: BASE, fetch })
  return client
}

afterEach(async () => {
  await client?.dispose()
  client = undefined
})

describe("apiClient", () => {
  it("lists content with the query encoded in the URL and decodes the contract types", async () => {
    const fake = makeFakeFetch(({ url }) => (url.pathname === "/content" ? json(200, [summary]) : undefined))
    const items = await make(fake.fetch).content.list({ locale: "am", phase: "abroad", kind: "article" })

    expect(items.map((item) => item.title)).toEqual(["ያልተከፈለ ደመወዝ"])
    const url = fake.requests[0]?.url
    expect(url?.searchParams.get("locale")).toBe("am")
    expect(url?.searchParams.get("phase")).toBe("abroad")
    expect(url?.searchParams.get("kind")).toBe("article")
  })

  it("maps a 404 NotFound to ApiError('not-found')", async () => {
    const fake = makeFakeFetch(() => json(404, { _tag: "NotFound", entity: "content", id: "missing" }))
    const error = await make(fake.fetch)
      .content.get("missing", "en")
      .catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).kind).toBe("not-found")
  })

  it("rejects an invalid content id before any request is made", async () => {
    const fake = makeFakeFetch()
    const error = await make(fake.fetch)
      .content.get("../etc/passwd", "en")
      .catch((e: unknown) => e)
    expect((error as ApiError).kind).toBe("invalid-request")
    expect(fake.requests).toHaveLength(0)
  })

  it("maps a 429 RateLimited to ApiError('rate-limited') with the retry delay", async () => {
    const fake = makeFakeFetch(() => json(429, { _tag: "RateLimited", scope: "assistant", retryAfterSeconds: 3600 }))
    const error = await make(fake.fetch)
      .assistant.askStream({ deviceId: DEVICE, locale: "en", question: "salary" }, () => undefined)
      .catch((e: unknown) => e)
    expect((error as ApiError).kind).toBe("rate-limited")
    expect((error as ApiError).retryAfterSeconds).toBe(3600)
  })

  it("maps transport failures to ApiError('network')", async () => {
    const failing = (async () => {
      throw new TypeError("Failed to fetch")
    }) as typeof globalThis.fetch
    const error = await make(failing)
      .directory.forCountry("SA")
      .catch((e: unknown) => e)
    expect((error as ApiError).kind).toBe("network")
  })

  it("streams assistant events in order and sends the validated payload", async () => {
    const events: Array<AssistantStreamEvent> = []
    const fake = makeFakeFetch(({ url }) =>
      url.pathname === "/assistant/ask/stream"
        ? sse([
            {
              _tag: "Emergency",
              notice: {
                categories: ["violence"],
                message: "Press SOS",
                contacts: [{ name: "Police", kind: "police", phone: "999" }]
              }
            },
            {
              _tag: "Citations",
              citations: [{ contentId: "abuse-what-to-do", title: "Abuse", locale: "en" }],
              grounded: true
            },
            { _tag: "Delta", text: "You are " },
            { _tag: "Delta", text: "not alone." },
            { _tag: "Done" }
          ])
        : undefined
    )

    await make(fake.fetch).assistant.askStream(
      { deviceId: DEVICE, locale: "en", country: "SA", question: "  He hits me  " },
      (event) => events.push(event)
    )

    expect(events.map((event) => event._tag)).toEqual(["Emergency", "Citations", "Delta", "Delta", "Done"])
    expect(fake.requests[0]?.method).toBe("POST")
    expect(fake.requests[0]?.body).toEqual({ deviceId: DEVICE, locale: "en", country: "SA", question: "He hits me" })
  })

  it("rejects with an AbortError when the caller cancels", async () => {
    const controller = new AbortController()
    const never = ((_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")))
      })) as typeof globalThis.fetch
    const pending = make(never).agencies.check("Selam", { signal: controller.signal })
    controller.abort()
    const error = await pending.catch((e: unknown) => e)
    expect(isAbortError(error)).toBe(true)
  })
})
