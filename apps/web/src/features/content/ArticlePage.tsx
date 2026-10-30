import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useApi } from "../../queries/ApiProvider.tsx"
import { contentQueries } from "../../queries/queries.ts"
import { useI18n } from "../../i18n/index.ts"
import { ArticleView } from "./ArticleView.tsx"

const route = getRouteApi("/$locale/articles/$id")

export const ArticlePage = () => {
  const { t } = useI18n()
  const { locale, id } = route.useParams()
  const { data } = useSuspenseQuery(contentQueries.detail(useApi(), id, locale))
  const eyebrow =
    data.kind === "rights" ? t.rights.eyebrow : data.phase === null ? undefined : t.phaseTitles[data.phase]
  return <ArticleView content={data} {...(eyebrow === undefined ? {} : { eyebrow })} />
}
