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

/**
 * Every port implemented on top of `Database`. Provide `DatabaseNode.layer`
 * or `DatabaseD1.layer` to choose the deployment target.
 */
export const RepositoriesLive = Layer.mergeAll(
  ContentRepoDrizzle,
  DirectoryRepoDrizzle,
  AgencyRepoDrizzle,
  CatalogWriterDrizzle,
  RetrieverFts,
  RateLimiterDrizzle,
  ChatPreferencesDrizzle,
  FeedbackRepoDrizzle
)
