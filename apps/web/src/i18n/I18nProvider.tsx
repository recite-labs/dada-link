import { createContext, type ReactNode, use, useEffect, useMemo } from "react"
import { type Messages, messagesFor } from "./catalog.ts"
import type { UiLocale } from "./locales.ts"

interface I18nValue {
  readonly locale: UiLocale
  readonly t: Messages
}

const I18nContext = createContext<I18nValue | null>(null)

/** Provides the active locale and its messages; keeps `<html lang>` in sync for fonts and screen readers. */
export const I18nProvider = ({ locale, children }: { readonly locale: UiLocale; readonly children: ReactNode }) => {
  const value = useMemo(() => ({ locale, t: messagesFor(locale) }), [locale])
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  return <I18nContext value={value}>{children}</I18nContext>
}

export const useI18n = (): I18nValue => {
  const value = use(I18nContext)
  if (value === null) throw new Error("useI18n must be used inside <I18nProvider>")
  return value
}
