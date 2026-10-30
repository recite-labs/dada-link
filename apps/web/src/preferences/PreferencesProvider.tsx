import { createContext, type ReactNode, use, useSyncExternalStore } from "react"
import type { PreferenceStore, Preferences } from "./store.ts"

const PreferencesContext = createContext<PreferenceStore | null>(null)

export const PreferencesProvider = ({
  store,
  children
}: {
  readonly store: PreferenceStore
  readonly children: ReactNode
}) => <PreferencesContext value={store}>{children}</PreferencesContext>

export const usePreferenceStore = (): PreferenceStore => {
  const store = use(PreferencesContext)
  if (store === null) throw new Error("usePreferenceStore must be used inside <PreferencesProvider>")
  return store
}

/** Current preferences; re-renders when they change. */
export const usePreferences = (): Preferences => {
  const store = usePreferenceStore()
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
