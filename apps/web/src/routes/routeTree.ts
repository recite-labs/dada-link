import {
  aboutRoute,
  agenciesRoute,
  articleRoute,
  askRoute,
  helpIndexRoute,
  helpRoute,
  homeRoute,
  indexRoute,
  journeyRoute,
  localeRoute,
  privacyRoute,
  rightsIndexRoute,
  rightsRoute
} from "./localeRoutes.tsx"
import { rootRoute } from "./rootRoute.tsx"

export const routeTree = rootRoute.addChildren([
  indexRoute,
  localeRoute.addChildren([
    homeRoute,
    askRoute,
    helpIndexRoute,
    helpRoute,
    rightsIndexRoute,
    rightsRoute,
    journeyRoute,
    articleRoute,
    agenciesRoute,
    aboutRoute,
    privacyRoute
  ])
])
