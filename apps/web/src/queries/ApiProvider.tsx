import { createContext, type ReactNode, use } from "react"
import type { DadaLinkApi } from "../api/index.ts"

const ApiContext = createContext<DadaLinkApi | null>(null)

/** Makes the API facade available to hooks; tests pass a fake. */
export const ApiProvider = ({ api, children }: { readonly api: DadaLinkApi; readonly children: ReactNode }) => (
  <ApiContext value={api}>{children}</ApiContext>
)

export const useApi = (): DadaLinkApi => {
  const api = use(ApiContext)
  if (api === null) throw new Error("useApi must be used inside <ApiProvider>")
  return api
}
