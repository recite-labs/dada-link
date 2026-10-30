import type { ReactNode } from "react"
import { EmergencyProvider } from "../features/emergency/EmergencyProvider.tsx"
import { I18nProvider, type UiLocale } from "../i18n/index.ts"
import { AppShell } from "./AppShell.tsx"

/** Language, emergency sheet and page frame for everything under `/:locale`. */
export const LocaleShell = ({ locale, children }: { readonly locale: UiLocale; readonly children: ReactNode }) => (
  <I18nProvider locale={locale}>
    <EmergencyProvider>
      <AppShell>{children}</AppShell>
    </EmergencyProvider>
  </I18nProvider>
)
