/** Static settings of the web app (no secrets: everything here ships in the bundle). */
export const APP_CONFIG = {
  /** Android app (applicationId me.kibru.damakese). */
  androidAppUrl: "https://play.google.com/store/apps/details?id=me.kibru.damakese",
  /** Where "Hide" sends the browser: an ordinary page that draws no attention. */
  quickExitUrl: "https://www.bbc.com/weather",
  /** API origin; empty means the same origin as the web app (default and recommended). */
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ""
} as const
