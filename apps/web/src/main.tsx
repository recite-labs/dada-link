import { createRoot } from "react-dom/client"
import { App } from "./App.tsx"
import { createApiClient } from "./api/index.ts"
import { APP_CONFIG } from "./config.ts"
import { browserStorage, createPreferenceStore } from "./preferences/index.ts"
import { createQueryClient } from "./queries/queryClient.ts"
import type { RouterContext } from "./routes/context.ts"
import { createAppRouter } from "./routes/router.ts"
import "./styles.css"

const context: RouterContext = {
  queryClient: createQueryClient(),
  api: createApiClient({ baseUrl: APP_CONFIG.apiBaseUrl === "" ? window.location.origin : APP_CONFIG.apiBaseUrl }),
  preferences: createPreferenceStore(browserStorage())
}
const router = createAppRouter(context)

const root = document.getElementById("root")
if (root === null) throw new Error("Missing #root element")
createRoot(root).render(<App router={router} context={context} />)
