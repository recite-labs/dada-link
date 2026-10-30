import { PersistenceError } from "@dadalink/ports"
import { Effect, Schema } from "effect"

/** Maps any driver or decoding failure to the port-level `PersistenceError`. */
export const persistence =
  (operation: string) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, PersistenceError, R> =>
    Effect.mapError(effect, (cause) => new PersistenceError({ operation, cause }))

/** Decodes a row into a domain value, failing with `PersistenceError` on corrupt data. */
export const decodeRow =
  <S extends Schema.Constraint & { readonly DecodingServices: never }>(schema: S, operation: string) =>
  (input: unknown): Effect.Effect<S["Type"], PersistenceError> =>
    Schema.decodeUnknownEffect(schema)(input).pipe(persistence(operation))

/** Drops `null` columns so optional domain keys stay absent (exactOptionalPropertyTypes). */
export const withoutNulls = <T extends Record<string, unknown>>(row: T): { [K in keyof T]: Exclude<T[K], null> } =>
  Object.fromEntries(Object.entries(row).filter(([, v]) => v !== null)) as { [K in keyof T]: Exclude<T[K], null> }
