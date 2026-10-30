import { catalogContract, chatPreferencesContract, rateLimiterContract, retrieverContract } from "@dadalink/testing"
import { MemoryCatalog, MemoryChatPreferences, MemoryRateLimiter } from "../src/index.ts"

catalogContract("Memory", () => MemoryCatalog.layer)
retrieverContract("Memory BM25", () => MemoryCatalog.layer)
rateLimiterContract("Memory", () => MemoryRateLimiter.layer)
chatPreferencesContract("Memory", () => MemoryChatPreferences.layer)
