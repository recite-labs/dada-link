import { createRouter, type RouterHistory } from "@tanstack/react-router"
import type { RouterContext } from "./context.ts"
import { routeTree } from "./routeTree.ts"

export const createAppRouter = (context: RouterContext, history?: RouterHistory) =>
  createRouter({
    routeTree,
    context,
    ...(history === undefined ? {} : { history }),
    defaultPreload: "intent",
    // Loaders read through TanStack Query, which owns caching.
    defaultPreloadStaleTime: 0,
    defaultPendingMs: 300,
    scrollRestoration: true
  })

export type AppRouter = ReturnType<typeof createAppRouter>

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter
  }
}
