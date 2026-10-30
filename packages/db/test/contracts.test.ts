import { catalogContract, chatPreferencesContract, rateLimiterContract, retrieverContract } from "@dadalink/testing"
import { makeSqliteTestLayer } from "./layers.ts"

catalogContract("SQLite (Drizzle)", makeSqliteTestLayer)
retrieverContract("SQLite FTS5", makeSqliteTestLayer)
rateLimiterContract("SQLite", makeSqliteTestLayer)
chatPreferencesContract("SQLite", makeSqliteTestLayer)
