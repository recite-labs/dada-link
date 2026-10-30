import { catalogContract, chatPreferencesContract, rateLimiterContract, retrieverContract } from "@dadalink/testing"
import { KvRateLimiter, type KvStore, MemoryCatalog, MemoryChatPreferences, MemoryRateLimiter } from "../src/index.ts"

catalogContract("Memory", () => MemoryCatalog.layer)
retrieverContract("Memory BM25", () => MemoryCatalog.layer)
rateLimiterContract("Memory", () => MemoryRateLimiter.layer)
chatPreferencesContract("Memory", () => MemoryChatPreferences.layer)

/** In-memory stand-in for a Workers KV namespace (TTL ignored; the limiter relies on its own clock). */
const fakeKv = (): KvStore => {
  const data = new Map<string, string>()
  return {
    get: async (key) => data.get(key) ?? null,
    put: async (key, value) => {
      data.set(key, value)
    }
  }
}

rateLimiterContract("Workers KV", () => KvRateLimiter.layer(fakeKv()))
