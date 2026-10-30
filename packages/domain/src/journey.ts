import { Schema } from "effect"

export const JOURNEY_PHASES = ["before", "abroad", "return"] as const

export const JourneyPhase = Schema.Literals(JOURNEY_PHASES).annotate({
  identifier: "JourneyPhase",
  description: "Stage of the migration journey: before leaving, while abroad, after returning"
})
export type JourneyPhase = typeof JourneyPhase.Type
