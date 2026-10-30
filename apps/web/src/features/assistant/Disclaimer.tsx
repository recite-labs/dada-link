import { useI18n } from "../../i18n/index.ts"
import { useEmergency } from "../emergency/EmergencyProvider.tsx"

export const Disclaimer = () => {
  const { t } = useI18n()
  const emergency = useEmergency()
  return (
    <p className="text-center text-[13px] text-muted">
      {t.ask.disclaimer}{" "}
      <button type="button" onClick={emergency.open} className="font-bold text-sos underline-offset-2 hover:underline">
        {t.ask.disclaimerSos}
      </button>
    </p>
  )
}
