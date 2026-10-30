import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import { ChatProvider } from "./features/assistant/ChatProvider.tsx"
import { PreferencesProvider } from "./preferences/index.ts"
import { ApiProvider } from "./queries/ApiProvider.tsx"
import type { RouterContext } from "./routes/context.ts"
import type { AppRouter } from "./routes/router.ts"

/** Providers shared by every page; the router renders pages inside them. */
export const App = ({ router, context }: { readonly router: AppRouter; readonly context: RouterContext }) => (
  <StrictMode>
    <QueryClientProvider client={context.queryClient}>
      <ApiProvider api={context.api}>
        <PreferencesProvider store={context.preferences}>
          <ChatProvider>
            <RouterProvider router={router} />
          </ChatProvider>
        </PreferencesProvider>
      </ApiProvider>
    </QueryClientProvider>
  </StrictMode>
)
