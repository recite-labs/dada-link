import { Link } from "@tanstack/react-router"
import type { ApiErrorKind } from "../../api/index.ts"
import { useI18n } from "../../i18n/index.ts"
import { usePreferences } from "../../preferences/index.ts"
import { Notice } from "../../ui/Notice.tsx"

/** Why an answer failed, with the next useful step. Quota exhaustion points to resources that are always open. */
export const TurnError = ({ kind, onRetry }: { readonly kind: ApiErrorKind; readonly onRetry: () => void }) => {
  const { t, locale } = useI18n()
  const { country, journey } = usePreferences()

  if (kind === "rate-limited") {
    return (
      <div className="flex flex-col gap-3">
        <Notice tone="warning" role="alert" title={t.ask.quotaTitle}>
          {t.ask.quotaBody}
        </Notice>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/$locale/help/$country"
            params={{ locale, country }}
            className="rounded-full bg-indigo px-4 py-2.5 text-[14px] font-bold text-ground hover:bg-deep"
          >
            {t.home.tiles.help.title}
          </Link>
          <Link
            to="/$locale/journey/$phase"
            params={{ locale, phase: journey }}
            className="rounded-full border border-line px-4 py-2.5 text-[14px] font-bold text-indigo hover:border-indigo"
          >
            {t.home.tiles.journey.title}
          </Link>
        </div>
      </div>
    )
  }

  const message =
    kind === "network" ? t.ask.errorNetwork : kind === "invalid-request" ? t.ask.errorInvalid : t.ask.errorUnavailable
  const retryable = kind === "network" || kind === "unavailable" || kind === "unexpected"
  return (
    <div className="flex flex-col items-start gap-3">
      <Notice tone="warning" role="alert" title={message} />
      {retryable ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-indigo px-4 py-2.5 text-[14px] font-bold text-ground hover:bg-deep"
        >
          {t.common.retry}
        </button>
      ) : null}
    </div>
  )
}
