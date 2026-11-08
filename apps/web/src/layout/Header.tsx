import { Link } from "@tanstack/react-router"
import { useEmergency } from "../features/emergency/EmergencyProvider.tsx"
import { useI18n } from "../i18n/index.ts"
import { HideButton } from "../safety/HideButton.tsx"
import { Wordmark } from "../ui/Logo.tsx"
import { LocaleSwitcher } from "./LocaleSwitcher.tsx"
import { NAV_ITEMS } from "./navItems.ts"

export const Header = () => {
  const { t, locale } = useI18n()
  const emergency = useEmergency()
  return (
    <header className="sticky top-0 z-30 border-b border-transparent bg-ground/95 backdrop-blur supports-[backdrop-filter]:bg-ground/80">
      <div className="mx-auto flex max-w-(--container-page) lg:max-w-(--container-wide) items-center justify-between gap-3 px-5 py-3 lg:px-8">
        <Link to="/$locale" params={{ locale }} aria-label={t.nav.homeLink} className="rounded-lg">
          <Wordmark />
        </Link>
        <nav aria-label={t.nav.main} className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              params={{ locale }}
              activeOptions={{ exact: item.exact }}
              className="rounded-full px-3 py-2 text-[15px] font-semibold text-muted hover:text-ink data-[status=active]:text-indigo"
            >
              {t.nav[item.key]}
            </Link>
          ))}
          <button
            type="button"
            onClick={emergency.open}
            className="ml-1 rounded-full bg-sos px-4 py-2 text-[15px] font-extrabold text-ground hover:bg-[#b81f33]"
          >
            {t.nav.sos}
          </button>
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <HideButton />
        </div>
      </div>
    </header>
  )
}
