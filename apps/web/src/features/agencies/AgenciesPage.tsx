import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { type FormEvent, useState } from "react"
import { useI18n } from "../../i18n/index.ts"
import { useApi } from "../../queries/ApiProvider.tsx"
import { agencyQueries } from "../../queries/queries.ts"
import { ChevronRightIcon, SearchIcon, ShieldIcon } from "../../ui/icons.tsx"
import { PageHeader } from "../../ui/PageHeader.tsx"
import { ErrorState, LoadingState } from "../../ui/States.tsx"
import { AgencyResult } from "./AgencyResult.tsx"

/** Content id of the guide on licensed agencies and illegal brokers. */
const BROKER_GUIDE_ID = "licensed-agencies-vs-brokers"

export const AgenciesPage = () => {
  const { t, locale } = useI18n()
  const api = useApi()
  const [draft, setDraft] = useState("")
  const [submitted, setSubmitted] = useState<string | null>(null)
  const check = useQuery({ ...agencyQueries.check(api, submitted ?? ""), enabled: submitted !== null })

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const query = draft.trim()
    if (query !== "") setSubmitted(query)
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t.agencies.title} intro={t.agencies.intro} />
      <search>
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <div className="flex h-14 items-center gap-2 rounded-full border-2 border-indigo bg-ground pr-1.5 pl-4">
            <SearchIcon size={20} className="shrink-0 text-muted" />
            <label htmlFor="agency-query" className="sr-only">
              {t.agencies.label}
            </label>
            <input
              id="agency-query"
              value={draft}
              maxLength={200}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t.agencies.placeholder}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-[17px] placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              className="h-11 rounded-full bg-indigo px-5 text-[15px] font-bold text-ground hover:bg-deep"
            >
              {t.agencies.submit}
            </button>
          </div>
          <p className="px-1 text-[13px] text-muted">{t.agencies.hint}</p>
        </form>
      </search>

      {submitted === null ? null : check.isPending ? (
        <LoadingState />
      ) : check.isError ? (
        <ErrorState error={check.error} onRetry={() => void check.refetch()} />
      ) : (
        <AgencyResult check={check.data} />
      )}

      <Link
        to="/$locale/articles/$id"
        params={{ locale, id: BROKER_GUIDE_ID }}
        className="flex items-center gap-3 border-y border-line py-4 text-[16px] font-bold hover:text-indigo"
      >
        <ShieldIcon size={20} className="text-indigo" />
        <span className="flex-1">{t.agencies.spotBroker}</span>
        <ChevronRightIcon size={18} className="text-muted" />
      </Link>
    </div>
  )
}
