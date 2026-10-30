import { readFileSync } from "node:fs"
import { join } from "node:path"
import { Api } from "@dadalink/api"
import { describe, expect, it } from "vitest"
import { CONTENT_SECURITY_POLICY } from "../csp.ts"

const repo = join(import.meta.dirname, "..", "..", "..")

/** wrangler.jsonc with full-line comments removed (the file has no trailing comments). */
const wranglerConfig = () => {
  const source = readFileSync(join(repo, "apps", "server-cloudflare", "wrangler.jsonc"), "utf8")
  const json = source
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n")
  return JSON.parse(json) as {
    readonly assets: {
      readonly directory: string
      readonly not_found_handling: string
      readonly run_worker_first: ReadonlyArray<string>
    }
  }
}

/** Glob as used by `run_worker_first`: `*` matches any characters. */
const globToRegExp = (glob: string) =>
  new RegExp(`^${glob.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`)

const samplePath = (path: string) => path.replace(/:[^/]+/g, "x")

describe("serving on Cloudflare Workers", () => {
  const { assets } = wranglerConfig()

  it("serves apps/web/dist with SPA fallback", () => {
    expect(assets.directory).toBe("../web/dist")
    expect(assets.not_found_handling).toBe("single-page-application")
  })

  it("runs the Worker first for every API endpoint", () => {
    const patterns = assets.run_worker_first.map(globToRegExp)
    const paths = Object.values(Api.groups).flatMap((group) =>
      Object.values(group.endpoints).map((endpoint) => samplePath(endpoint.path))
    )
    for (const path of paths)
      expect(
        patterns.some((pattern) => pattern.test(path)),
        path
      ).toBe(true)
  })

  it("never runs the Worker first for app pages", () => {
    const patterns = assets.run_worker_first.map(globToRegExp)
    for (const page of ["/", "/am", "/om/help/SA", "/en/articles/passport-taken", "/assets/index.js"]) {
      expect(
        patterns.some((pattern) => pattern.test(page)),
        page
      ).toBe(false)
    }
  })
})

describe("Content-Security-Policy", () => {
  it("allows only this origin", () => {
    expect(CONTENT_SECURITY_POLICY).toContain("default-src 'self'")
    expect(CONTENT_SECURITY_POLICY).toContain("connect-src 'self'")
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/https?:/)
  })
})
