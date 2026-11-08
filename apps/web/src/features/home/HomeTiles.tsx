import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { useI18n } from "../../i18n/index.ts"
import { usePreferences } from "../../preferences/index.ts"
import { BadgeIcon, BookIcon, PhoneIcon, ShieldIcon } from "../../ui/icons.tsx"

const Tile = ({ icon, title, body }: { readonly icon: ReactNode; readonly title: string; readonly body: string }) => (
  <span className="flex h-full flex-col gap-3 rounded-[var(--radius-card)] bg-surface p-4 transition-colors lg:gap-6 lg:p-6 group-hover:bg-tint">
    <span className="text-indigo">{icon}</span>
    <span className="flex flex-col gap-0.5">
      <span className="text-[16px] leading-[20px] font-bold lg:text-[18px] lg:leading-[24px]">{title}</span>
      <span className="text-[13px] leading-[17px] text-muted lg:text-[14px] lg:leading-[20px]">{body}</span>
    </span>
  </span>
)

export const HomeTiles = () => {
  const { t, locale } = useI18n()
  const { country, journey } = usePreferences()
  const tiles = t.home.tiles
  const linkClass = "group rounded-[var(--radius-card)]"

  return (
    <nav aria-label={t.nav.main} className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:gap-4">
      <Link to="/$locale/help/$country" params={{ locale, country }} className={linkClass}>
        <Tile icon={<PhoneIcon size={26} />} title={tiles.help.title} body={tiles.help.body} />
      </Link>
      <Link to="/$locale/rights/$country" params={{ locale, country }} className={linkClass}>
        <Tile icon={<ShieldIcon size={26} />} title={tiles.rights.title} body={tiles.rights.body} />
      </Link>
      <Link to="/$locale/journey/$phase" params={{ locale, phase: journey }} className={linkClass}>
        <Tile icon={<BookIcon size={26} />} title={tiles.journey.title} body={tiles.journey.body} />
      </Link>
      <Link to="/$locale/agencies" params={{ locale }} className={linkClass}>
        <Tile icon={<BadgeIcon size={26} />} title={tiles.agencies.title} body={tiles.agencies.body} />
      </Link>
    </nav>
  )
}
