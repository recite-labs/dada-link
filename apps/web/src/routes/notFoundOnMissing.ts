import { notFound } from "@tanstack/react-router"
import { isApiError } from "../api/index.ts"

/** Turns an API `not-found` into the router's 404 so the not-found page renders. */
export const notFoundOnMissing = async <A>(promise: Promise<A>): Promise<A> => {
  try {
    return await promise
  } catch (error) {
    if (isApiError(error) && (error.kind === "not-found" || error.kind === "invalid-request")) throw notFound()
    throw error
  }
}
