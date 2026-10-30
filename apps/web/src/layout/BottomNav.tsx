import { Link } from "@tanstack/react-router"
import { useEmergency } from "../features/emergency/EmergencyProvider.tsx"
import { useI18n } from "../i18n/index.ts"
import { ChatIcon, HomeIcon, InfoIcon, PhoneIcon } from "../ui/icons.tsx"
import { NAV_ITEMS } from "./navItems.ts"

const ICONS = { home: HomeIcon, ask: ChatIcon, help: PhoneIcon, about: InfoIcon } as const

/** Mobile tab bar with SOS raised in the middle, as in the app. */
export const BottomNav = () => {
  const { t, locale } = useI18n()
  const emergency = useEmergency()
  const [home, ask, help, about] = NAV_ITEMS

  const tab = (item: (typeof NAV_ITEMS)[number]) => {
    const Icon = ICONS[item.key]
    return (
      <Link
        key={item.key}
        to={item.to}
        params={{ locale }}
        activeOptions={{ exact: item.exact }}
        className="flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[12px] font-semibold text-muted data-[status=active]:text-indigo"
      >
        <Icon size={22} />
        {t.nav[item.key]}
      </Link>
    )
  }

  return (
    <nav
      aria-label={t.nav.main}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ground pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="mx-auto flex max-w-(--container-page) items-end px-2 pt-1.5 pb-2">
        {tab(home)}
        {tab(ask)}
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={emergency.open}
            className="-mt-7 flex size-16 items-center justify-center rounded-full border-4 border-ground bg-sos text-[17px] font-extrabold text-ground shadow-[0_0_0_6px_rgba(215,38,61,0.14)]"
          >
            {t.nav.sos}
          </button>
        </div>
        {tab(help)}
        {tab(about)}
      </div>
    </nav>
  )
}
