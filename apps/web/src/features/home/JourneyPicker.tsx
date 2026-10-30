import { JOURNEY_PHASES } from "@dadalink/domain"
import { useI18n } from "../../i18n/index.ts"
import { countriesFor, selectJourney, usePreferenceStore, usePreferences } from "../../preferences/index.ts"
import { ChoiceGroup } from "../../ui/ChoiceGroup.tsx"

/** Journey step (Before · Abroad · Return) and the matching country, remembered on this device. */
export const JourneyPicker = () => {
  const { t } = useI18n()
  const store = usePreferenceStore()
  const { journey, country } = usePreferences()

  return (
    <section className="flex flex-col gap-4">
      <ChoiceGroup
        variant="segmented"
        label={t.home.journeyLabel}
        value={journey}
        onChange={(next) => store.update(selectJourney({ journey, country }, next))}
        choices={JOURNEY_PHASES.map((phase) => ({ value: phase, label: t.phases[phase] }))}
      />
      <div className="flex flex-col gap-2">
        <p className="text-[14px] font-semibold text-muted">{t.home.countryLabel[journey]}</p>
        <ChoiceGroup
          variant="chips"
          label={t.home.countryLabel[journey]}
          value={country}
          onChange={(next) => store.update({ country: next })}
          choices={countriesFor(journey).map((code) => ({ value: code, label: t.countriesShort[code] }))}
        />
      </div>
    </section>
  )
}
