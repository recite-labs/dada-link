import { Result, Schema } from "effect"
import { parse } from "yaml"
import { type Checked, error, failed, ok } from "./issues.ts"

/** Parses YAML 1.2 (core schema: dates stay strings) into an unknown value. */
export const parseYaml = (file: string, text: string): Checked<unknown> => {
  try {
    return ok(parse(text, { schema: "core", uniqueKeys: true }) as unknown)
  } catch (cause) {
    return failed([error(file, `Invalid YAML: ${cause instanceof Error ? cause.message : String(cause)}`)])
  }
}

/** Validates with a schema, turning schema errors into readable issues. */
export const decodeWith =
  <S extends Schema.Constraint & { readonly DecodingServices: never }>(schema: S) =>
  (file: string, input: unknown): Checked<S["Type"]> => {
    const result = Schema.decodeUnknownResult(schema)(input, { errors: "all" })
    return Result.isSuccess(result)
      ? ok(result.success)
      : failed([error(file, result.failure.message.replace(/\s+/g, " ").trim())])
  }
