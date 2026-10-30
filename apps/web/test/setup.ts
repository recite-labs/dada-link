import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, beforeAll } from "vitest"

beforeAll(() => {
  // jsdom has no layout: the router's scroll restoration only needs these to exist.
  window.scrollTo = () => undefined
  Element.prototype.scrollIntoView = () => undefined
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  document.documentElement.lang = ""
})
