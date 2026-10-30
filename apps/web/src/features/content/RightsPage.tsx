import { COUNTRIES } from "@dadalink/domain"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useI18n } from "../../i18n/index.ts"
import { usePreferenceStore } from "../../preferences/index.ts"
import { useApi } from "../../queries/ApiProvider.tsx"
import { contentQueries, rightsContentId } from "../../queries/queries.ts"
import { ChoiceGroup } from "../../ui/ChoiceGroup.tsx"
import { ArticleView } from "./ArticleView.tsx"

const route = getRouteApi("/$locale/rights/$country")

export const RightsPage = () => {
  const { t } = useI18n()
  const { locale, country } = route.useParams()
  const navigate = route.useNavigate()
  const preferences = usePreferenceStore()
  const { data } = useSuspenseQuery(contentQueries.detail(useApi(), rightsContentId(country), locale))

  return (
    <ArticleView
      content={data}
      eyebrow={`${t.rights.eyebrow} · ${t.countries[country]}`}
      beforeTitle={
        <ChoiceGroup
          variant="chips"
          label={t.rights.chooseCountry}
          value={country}
          onChange={(next) => {
            preferences.update({ country: next })
            void navigate({ params: (previous) => ({ ...previous, country: next }) })
          }}
          choices={COUNTRIES.map((code) => ({ value: code, label: t.countriesShort[code] }))}
        />
      }
    />
  )
}
