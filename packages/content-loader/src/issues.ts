import { Schema } from "effect"

export const ContentIssue = Schema.Struct({
  /** Path relative to the content root, using `/`. */
  file: Schema.String,
  severity: Schema.Literals(["error", "warning"]),
  message: Schema.String
})
export type ContentIssue = typeof ContentIssue.Type

/** The content tree has errors; every issue found is listed. */
export class ContentValidationFailed extends Schema.TaggedError<ContentValidationFailed>()("ContentValidationFailed", {
  issues: Schema.Array(ContentIssue)
}) {
  override get message(): string {
    return `Content validation failed:\n${this.issues.map((i) => `  ${i.severity} ${i.file}: ${i.message}`).join("\n")}`
  }
}

export const error = (file: string, message: string): ContentIssue => ({ file, severity: "error", message })
export const warning = (file: string, message: string): ContentIssue => ({ file, severity: "warning", message })

/** A value plus the issues found while producing it (`undefined` value = unusable). */
export interface Checked<A> {
  readonly value: A | undefined
  readonly issues: ReadonlyArray<ContentIssue>
}

export const ok = <A>(value: A, issues: ReadonlyArray<ContentIssue> = []): Checked<A> => ({ value, issues })
export const failed = <A>(issues: ReadonlyArray<ContentIssue>): Checked<A> => ({ value: undefined, issues })
