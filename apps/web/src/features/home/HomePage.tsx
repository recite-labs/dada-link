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
    <div className="flex flex-col gap-6 pt-2 lg:grid lg:grid-cols-2 lg:gap-x-12 lg:gap-y-10 lg:pt-10">
      <div className="flex flex-col gap-6 lg:justify-center lg:gap-8">
        <header className="flex flex-col gap-2">
          <p className="flex items-center gap-1.5 text-[14px] text-muted">
            <PinIcon size={15} />
            {t.countries[country]} · {t.phaseTitles[journey]}
          </p>
          <h1 className="text-[34px] leading-[40px] font-extrabold tracking-tight text-balance sm:text-[40px] sm:leading-[46px] lg:text-[52px] lg:leading-[58px]">
            {t.home.greeting}
            <br />
            {t.home.question}
          </h1>
        </header>
        <JourneyPicker />
      </div>
      <AskDadaCard />
      <div className="lg:col-span-2">
        <HomeTiles />
      </div>
      <div className="lg:col-span-2">
        <EmergencyCard />
      </div>
    </div>
  )
}
