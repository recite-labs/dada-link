import { JOURNEY_PHASES } from "@dadalink/domain"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useApi } from "../../queries/ApiProvider.tsx"
import { contentQueries } from "../../queries/queries.ts"
import { useI18n } from "../../i18n/index.ts"
import { selectJourney, usePreferenceStore, usePreferences } from "../../preferences/index.ts"
import { ChoiceGroup } from "../../ui/ChoiceGroup.tsx"
import { Notice } from "../../ui/Notice.tsx"
import { PageHeader } from "../../ui/PageHeader.tsx"
import { ArticleCard } from "./ArticleCard.tsx"

const route = getRouteApi("/$locale/journey/$phase")

export const JourneyPage = () => {
  const { t } = useI18n()
  const { locale, phase } = route.useParams()
  const navigate = route.useNavigate()
  const store = usePreferenceStore()
  const preferences = usePreferences()
  const { data } = useSuspenseQuery(contentQueries.journey(useApi(), phase, locale))

  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow={t.journey.eyebrow} title={t.phaseTitles[phase]} />
      <ChoiceGroup
        variant="segmented"
        label={t.home.journeyLabel}
        value={phase}
        onChange={(next) => {
          store.update(selectJourney(preferences, next))
          void navigate({ params: (previous) => ({ ...previous, phase: next }) })
        }}
        choices={JOURNEY_PHASES.map((value) => ({ value, label: t.phases[value] }))}
      />
      {data.length === 0 ? (
        <Notice title={t.journey.empty} />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {data.map((item) => (
            <ArticleCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  )
}
