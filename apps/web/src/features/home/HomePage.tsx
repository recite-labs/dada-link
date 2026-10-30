import { useI18n } from "../../i18n/index.ts"
import { usePreferences } from "../../preferences/index.ts"
import { PinIcon } from "../../ui/icons.tsx"
import { AskDadaCard } from "./AskDadaCard.tsx"
import { EmergencyCard } from "./EmergencyCard.tsx"
import { HomeTiles } from "./HomeTiles.tsx"
import { JourneyPicker } from "./JourneyPicker.tsx"

export const HomePage = () => {
  const { t } = useI18n()
  const { country, journey } = usePreferences()
  return (
    <div className="flex flex-col gap-6 pt-2">
      <header className="flex flex-col gap-2">
        <p className="flex items-center gap-1.5 text-[14px] text-muted">
          <PinIcon size={15} />
          {t.countries[country]} · {t.phaseTitles[journey]}
        </p>
        <h1 className="text-[34px] leading-[40px] font-extrabold tracking-tight text-balance sm:text-[40px] sm:leading-[46px]">
          {t.home.greeting}
          <br />
          {t.home.question}
        </h1>
      </header>
      <JourneyPicker />
      <AskDadaCard />
      <HomeTiles />
      <EmergencyCard />
    </div>
  )
}
