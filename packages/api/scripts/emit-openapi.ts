import { writeFileSync } from "node:fs"
import { OpenApi } from "effect/http-api"
import { Api } from "../src/index.ts"

const target = new URL("../openapi.json", import.meta.url)
writeFileSync(target, `${JSON.stringify(OpenApi.fromApi(Api), null, 2)}\n`)
process.stdout.write(`wrote ${target.pathname}\n`)
