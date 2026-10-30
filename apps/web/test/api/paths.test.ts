import { Api } from "@dadalink/api"
import { describe, expect, it } from "vitest"
import { API_PATH_PREFIXES } from "../../src/api/paths.ts"
import { UI_LOCALES } from "../../src/i18n/locales.ts"

const endpointPaths = Object.values(Api.groups).flatMap((group) =>
  Object.values(group.endpoints).map((endpoint) => endpoint.path)
)

const isUnder = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`)

describe("API path prefixes", () => {
  it("cover every endpoint of the HttpApi contract", () => {
    expect(endpointPaths.length).toBeGreaterThan(5)
    for (const path of endpointPaths) {
      expect(
        API_PATH_PREFIXES.some((prefix) => isUnder(path, prefix)),
        path
      ).toBe(true)
    }
  })

  it("never collide with the web app's locale prefixes", () => {
    for (const locale of UI_LOCALES) {
      expect(API_PATH_PREFIXES.some((prefix) => isUnder(`/${locale}`, prefix))).toBe(false)
    }
  })
})
