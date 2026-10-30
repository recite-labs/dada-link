import { useNavigate } from "@tanstack/react-router"
import { CATALOG, UI_LOCALES, type UiLocale, useI18n } from "../i18n/index.ts"
import { ChevronDownIcon } from "../ui/icons.tsx"

/** Native select: reliable on every phone, labelled in each language's own name. */
export const LocaleSwitcher = () => {
  const { locale, t } = useI18n()
  const navigate = useNavigate()

  const change = (next: UiLocale) =>
    navigate({ to: ".", params: (previous: Record<string, string>) => ({ ...previous, locale: next }) })

  return (
    <div className="relative flex min-h-10 items-center rounded-full bg-surface pr-7 pl-3 text-[14px] font-bold text-indigo">
      <span aria-hidden="true">{t.meta.shortLabel}</span>
      <select
        aria-label={t.nav.language}
        value={locale}
        onChange={(event) => change(event.target.value as UiLocale)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {UI_LOCALES.map((option) => (
          <option key={option} value={option} lang={option}>
            {CATALOG[option].meta.languageName}
          </option>
        ))}
      </select>
      <ChevronDownIcon size={14} strokeWidth={2.6} className="pointer-events-none absolute right-2.5" />
    </div>
  )
}
