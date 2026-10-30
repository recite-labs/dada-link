import { readFileSync } from "node:fs"
import { Api } from "@dadalink/api"
import { describe, expect, it } from "@effect/vitest"
import { OpenApi } from "effect/http-api"

describe("OpenAPI document", () => {
  it("is generated from the contract and committed up to date (run `pnpm --filter @dadalink/api openapi`)", () => {
    const committed = JSON.parse(readFileSync(new URL("../../api/openapi.json", import.meta.url), "utf8"))
    expect(committed).toEqual(JSON.parse(JSON.stringify(OpenApi.fromApi(Api))))
  })
})
