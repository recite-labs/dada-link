/** What went wrong, from the user's point of view. Components branch on this, never on HTTP details. */
export type ApiErrorKind = "not-found" | "rate-limited" | "unavailable" | "invalid-request" | "network" | "unexpected"

/** Plain error thrown by `apiClient` promises (no Effect types leak into components). */
export class ApiError extends Error {
  override readonly name = "ApiError"
  readonly kind: ApiErrorKind
  /** Set for `rate-limited`: seconds until the quota resets. */
  readonly retryAfterSeconds: number | undefined

  constructor(kind: ApiErrorKind, options: { readonly message?: string; readonly retryAfterSeconds?: number } = {}) {
    super(options.message ?? kind)
    this.kind = kind
    this.retryAfterSeconds = options.retryAfterSeconds
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError

export const isAbortError = (error: unknown): boolean => error instanceof DOMException && error.name === "AbortError"
