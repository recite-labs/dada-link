import { COUNTRIES } from "@dadalink/domain"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useApi } from "../../queries/ApiProvider.tsx"
import { directoryQueries } from "../../queries/queries.ts"
import { useI18n } from "../../i18n/index.ts"
import { usePreferenceStore } from "../../preferences/index.ts"
import { CountrySelect } from "../../ui/CountrySelect.tsx"
import { PageHeader } from "../../ui/PageHeader.tsx"
import { HelpDirectory } from "./HelpDirectory.tsx"

const route = getRouteApi("/$locale/help/$country")

export const HelpPage = () => {
  const { t } = useI18n()
  const { country } = route.useParams()
  const navigate = route.useNavigate()
  const preferences = usePreferenceStore()
  const { data } = useSuspenseQuery(directoryQueries.forCountry(useApi(), country))

  return (
    <div>
      <PageHeader
        title={t.help.title}
        aside={
          <CountrySelect
            value={country}
            options={COUNTRIES}
            onChange={(next) => {
              preferences.update({ country: next })
              void navigate({ params: (previous) => ({ ...previous, country: next }) })
            }}
          />
        }
      />
      <HelpDirectory entries={data} />
    </div>
  )
}
