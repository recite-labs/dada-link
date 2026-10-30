import { Schema } from "effect"

/**
 * One vocabulary for what an article covers and what a help service helps
 * with. Includes Track B's `HelpTopic` values plus broader editorial topics.
 */
export const TOPICS = [
  // Track B HelpTopic
  "emergency",
  "abuse",
  "sexual-violence",
  "wages",
  "passport",
  "documents",
  "labour-complaint",
  "shelter",
  "repatriation",
  "legal",
  "health",
  "mental-health",
  "trafficking",
  "detention",
  "returnee-support",
  "fire",
  // editorial
  "srh",
  "rights",
  "money",
  "agencies",
  "safety",
  "return"
] as const
export const Topic = Schema.Literals(TOPICS).annotate({ identifier: "Topic" })
export type Topic = typeof Topic.Type
