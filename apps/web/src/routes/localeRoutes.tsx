import { createRoute, lazyRouteComponent, Outlet, redirect, useParams } from "@tanstack/react-router"
import { useEffect } from "react"
import { contentQueries, directoryQueries, rightsContentId } from "../queries/queries.ts"
import { NotFoundPage } from "../features/errors/NotFoundPage.tsx"
import { RouteError } from "../features/errors/RouteError.tsx"
import { HomePage } from "../features/home/HomePage.tsx"
import { isUiLocale } from "../i18n/index.ts"
import { LocaleShell } from "../layout/LocaleShell.tsx"
import { usePreferenceStore } from "../preferences/index.ts"
import { LoadingState } from "../ui/States.tsx"
import { preferredLocale } from "./context.ts"
import { notFoundOnMissing } from "./notFoundOnMissing.ts"
import { parseCountryParam, parseLocaleParam, parsePhaseParam } from "./params.ts"
import { rootRoute } from "./rootRoute.tsx"

/** `/` sends her to her language: saved choice, browser language, else Amharic. */
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: ({ context }) => {
    throw redirect({ to: "/$locale", params: { locale: preferredLocale(context.preferences) }, replace: true })
  }
})

const LocaleLayout = () => {
  const { locale } = localeRoute.useParams()
  const preferences = usePreferenceStore()
  // Remember the language she is reading (not on preload: hovering a link must not change it).
  useEffect(() => preferences.update({ locale }), [preferences, locale])
  return (
    <LocaleShell locale={locale}>
      <Outlet />
    </LocaleShell>
  )
}

/** 404 inside a locale: the layout is replaced, so the shell is rendered here too. */
const LocaleNotFound = () => {
  const params = useParams({ strict: false })
  const preferences = usePreferenceStore()
  const locale = isUiLocale(params.locale) ? params.locale : preferredLocale(preferences)
  return (
    <LocaleShell locale={locale}>
      <NotFoundPage />
    </LocaleShell>
  )
}

/** Every page lives under `/:locale` (am | om | en). */
export const localeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$locale",
  params: { parse: parseLocaleParam, stringify: ({ locale }) => ({ locale }) },
  component: LocaleLayout,
  notFoundComponent: LocaleNotFound,
  errorComponent: RouteError,
  pendingComponent: () => <LoadingState />
})

export const homeRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: "/",
  component: HomePage
})

export const askRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: "ask",
  component: lazyRouteComponent(() => import("../features/assistant/AskPage.tsx"), "AskPage")
})

/** `/:locale/help` opens the directory of the saved country. */
export const helpIndexRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: "help",
  beforeLoad: ({ context, params }) => {
    throw redirect({
      to: "/$locale/help/$country",
      params: { locale: params.locale, country: context.preferences.get().country },
      replace: true
    })
  }
})

export const helpRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: "help/$country",
  params: { parse: parseCountryParam, stringify: ({ country }) => ({ country }) },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(directoryQueries.forCountry(context.api, params.country)),
  component: lazyRouteComponent(() => import("../features/help/HelpPage.tsx"), "HelpPage")
})

export const rightsIndexRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: "rights",
  beforeLoad: ({ context, params }) => {
    throw redirect({
      to: "/$locale/rights/$country",
      params: { locale: params.locale, country: context.preferences.get().country },
      replace: true
    })
  }
})

export const rightsRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: "rights/$country",
  params: { parse: parseCountryParam, stringify: ({ country }) => ({ country }) },
  loader: ({ context, params }) =>
    notFoundOnMissing(
      context.queryClient.ensureQueryData(
        contentQueries.detail(context.api, rightsContentId(params.country), params.locale)
      )
    ),
  component: lazyRouteComponent(() => import("../features/content/RightsPage.tsx"), "RightsPage")
})

export const journeyRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: "journey/$phase",
  params: { parse: parsePhaseParam, stringify: ({ phase }) => ({ phase }) },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(contentQueries.journey(context.api, params.phase, params.locale)),
  component: lazyRouteComponent(() => import("../features/content/JourneyPage.tsx"), "JourneyPage")
})

export const articleRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: "articles/$id",
  loader: ({ context, params }) =>
    notFoundOnMissing(
      context.queryClient.ensureQueryData(contentQueries.detail(context.api, params.id, params.locale))
    ),
  component: lazyRouteComponent(() => import("../features/content/ArticlePage.tsx"), "ArticlePage")
})

export const agenciesRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: "agencies",
  component: lazyRouteComponent(() => import("../features/agencies/AgenciesPage.tsx"), "AgenciesPage")
})

export const aboutRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: "about",
  component: lazyRouteComponent(() => import("../features/about/AboutPage.tsx"), "AboutPage")
})
