import { QueryClientProvider } from "@tanstack/react-query"
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router"
import { render } from "@testing-library/react"
import type { ReactNode } from "react"
import { App } from "../src/App.tsx"
import type { DadaLinkApi } from "../src/api/index.ts"
import { ChatProvider } from "../src/features/assistant/ChatProvider.tsx"
import { EmergencyProvider } from "../src/features/emergency/EmergencyProvider.tsx"
import { I18nProvider, type UiLocale } from "../src/i18n/index.ts"
import { createPreferenceStore, type PreferenceStore, PreferencesProvider } from "../src/preferences/index.ts"
import { ApiProvider } from "../src/queries/ApiProvider.tsx"
import { createQueryClient } from "../src/queries/queryClient.ts"
import type { RouterContext } from "../src/routes/context.ts"
import { createAppRouter } from "../src/routes/router.ts"
import { makeFakeApi } from "./fakeApi.ts"

const testQueryClient = () => {
  const client = createQueryClient()
  client.setDefaultOptions({ queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } })
  return client
}

interface Options {
  readonly locale?: UiLocale
  readonly api?: DadaLinkApi
  readonly preferences?: PreferenceStore
}

/**
 * Renders a component inside every app provider and a one-route router (so
 * `<Link>` works) without the page shell.
 */
export const renderWithProviders = (ui: ReactNode, options: Options = {}) => {
  const api = options.api ?? makeFakeApi().api
  const preferences = options.preferences ?? createPreferenceStore(window.localStorage)
  const queryClient = testQueryClient()
  const locale = options.locale ?? "en"
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => (
        <I18nProvider locale={locale}>
          <EmergencyProvider>{ui}</EmergencyProvider>
        </I18nProvider>
      )
    }),
    history: createMemoryHistory({ initialEntries: [`/${locale}`] })
  })
  const result = render(
    <QueryClientProvider client={queryClient}>
      <ApiProvider api={api}>
        <PreferencesProvider store={preferences}>
          <ChatProvider>
            <RouterProvider router={router as never} />
          </ChatProvider>
        </PreferencesProvider>
      </ApiProvider>
    </QueryClientProvider>
  )
  return { ...result, api, preferences, queryClient, router }
}

/** Renders the real app (routes, loaders, shell) at `path` with a fake API. */
export const renderApp = (path: string, options: Omit<Options, "locale"> = {}) => {
  const context: RouterContext = {
    api: options.api ?? makeFakeApi().api,
    preferences: options.preferences ?? createPreferenceStore(window.localStorage),
    queryClient: testQueryClient()
  }
  const history = createMemoryHistory({ initialEntries: [path] })
  const router = createAppRouter(context, history)
  const result = render(<App router={router} context={context} />)
  return { ...result, router, history, context }
}
