import type { QueryClient } from "@tanstack/react-query"
import type { DadaLinkApi } from "../api/index.ts"
import { negotiateLocale, type UiLocale } from "../i18n/index.ts"
import type { PreferenceStore } from "../preferences/index.ts"

/** Dependencies available to every route's `beforeLoad` and `loader`. */
export interface RouterContext {
  readonly queryClient: QueryClient
  readonly api: DadaLinkApi
  readonly preferences: PreferenceStore
}

/** The saved language, else the browser's, else Amharic. */
export const preferredLocale = (preferences: PreferenceStore): UiLocale =>
  preferences.get().locale ?? negotiateLocale(typeof navigator === "undefined" ? [] : navigator.languages)
