import { Schema } from "effect"

/**
 * Infrastructure failure of a driven adapter (database, KV, ...). Use cases
 * usually treat it as a defect at the edge; it is typed so adapters never
 * leak driver-specific errors through ports.
 */
export class PersistenceError extends Schema.TaggedError<PersistenceError>()("PersistenceError", {
  operation: Schema.String,
  cause: Schema.Defect()
}) {}
