import type { ExecutionContext } from "@cloudflare/workers-types"
import { waitUntilBackgroundTasks } from "@dadalink/adapters"
import { BackgroundTasks } from "@dadalink/ports"
import { Context } from "effect"
import { HttpRouter } from "effect/http"
import { makeWorkerApp } from "./AppLayer.ts"
import type { Env } from "./env.ts"

type Handler = (request: Request, context: Context.Context<BackgroundTasks>) => Promise<Response>

let cachedHandler: Handler | undefined

/** Built once per isolate (bindings are stable) and reused across requests. */
const handlerFor = (env: Env): Handler => {
  cachedHandler ??= HttpRouter.toWebHandler(makeWorkerApp(env)).handler
  return cachedHandler
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Telegram updates are processed after the response via `ctx.waitUntil`.
    const background = waitUntilBackgroundTasks((promise) => ctx.waitUntil(promise))
    return handlerFor(env)(request, Context.make(BackgroundTasks, background))
  }
}
