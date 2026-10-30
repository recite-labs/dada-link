import { useI18n } from "../../i18n/index.ts"
import { usePreferences } from "../../preferences/index.ts"
import { PhoneIcon } from "../../ui/icons.tsx"
import { useEmergency } from "../emergency/EmergencyProvider.tsx"

/** Visible emergency entry on Home: opens the numbers for the selected country. */
export const EmergencyCard = () => {
  const { t } = useI18n()
  const { country } = usePreferences()
  const emergency = useEmergency()
  return (
    <button
      type="button"
      onClick={emergency.open}
      className="flex w-full items-center gap-4 rounded-[var(--radius-card)] bg-sos-tint p-4 text-left transition-colors hover:bg-[#f8d5da]"
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[13px] font-bold tracking-[0.06em] text-sos uppercase">{t.nav.sos}</span>
        <span className="text-[18px] leading-[24px] font-extrabold">{t.home.emergencyTitle}</span>
        <span className="text-[14px] text-muted">{t.home.emergencyBody(t.countries[country])}</span>
      </span>
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sos text-ground">
        <PhoneIcon size={21} />
      </span>
      <span className="sr-only">{t.home.emergencyAction}</span>
    </button>
  )
}
