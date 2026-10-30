import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { NotFoundPage } from "../features/errors/NotFoundPage.tsx"
import { RootError } from "../features/errors/RootError.tsx"
import { LocaleShell } from "../layout/LocaleShell.tsx"
import { usePreferenceStore } from "../preferences/index.ts"
import { preferredLocale, type RouterContext } from "./context.ts"

/** 404 for paths outside any locale (e.g. `/xyz`), shown in the preferred language. */
const RootNotFound = () => {
  const preferences = usePreferenceStore()
  return (
    <LocaleShell locale={preferredLocale(preferences)}>
      <NotFoundPage />
    </LocaleShell>
  )
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  notFoundComponent: RootNotFound,
  errorComponent: RootError
})
