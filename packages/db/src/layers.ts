import { Layer } from "effect"
import {
  AgencyRepoDrizzle,
  CatalogWriterDrizzle,
  ChatPreferencesDrizzle,
  ContentRepoDrizzle,
  DirectoryRepoDrizzle,
  FeedbackRepoDrizzle,
  RateLimiterDrizzle,
  RetrieverFts
} from "./repos/index.ts"

/** Catalogue, retrieval, chat preferences and feedback on top of `Database`. */
export const StoreRepositoriesLive = Layer.mergeAll(
  ContentRepoDrizzle,
  DirectoryRepoDrizzle,
  AgencyRepoDrizzle,
  CatalogWriterDrizzle,
  RetrieverFts,
  ChatPreferencesDrizzle,
  FeedbackRepoDrizzle
)

/**
 * Every port implemented on top of `Database`, including the SQL rate limiter.
 * Provide `DatabaseNode.layer` or `DatabaseD1.layer` to choose the target.
 */
export const RepositoriesLive = Layer.mergeAll(StoreRepositoriesLive, RateLimiterDrizzle)
