import type { AgencyCheck, AgencyVerdict } from "@dadalink/domain"
import { Link } from "@tanstack/react-router"
import { useI18n } from "../../i18n/index.ts"
import { cx } from "../../ui/cx.ts"
import { AlertIcon, CheckIcon } from "../../ui/icons.tsx"

type Tone = "safe" | "warning" | "danger"

const TONE: Record<AgencyVerdict, Tone> = {
  licensed: "safe",
  suspended: "danger",
  revoked: "danger",
  unknown: "warning",
  "not-found": "warning"
}

const BOX: Record<Tone, string> = {
  safe: "bg-safe-tint",
  warning: "bg-marigold-tint",
  danger: "bg-sos-tint"
}

const BADGE: Record<Tone, string> = {
  safe: "bg-safe text-ground",
  warning: "bg-marigold-ink text-ground",
  danger: "bg-sos text-ground"
}

const TITLE: Record<Tone, string> = {
  safe: "text-safe",
  warning: "text-marigold-ink",
  danger: "text-sos"
}

/**
 * Outcome of an agency check. "Not found" is never presented as "illegal":
 * the published list may be incomplete, so the advice is not to pay and to ask.
 */
export const AgencyResult = ({ check }: { readonly check: AgencyCheck }) => {
  const { t, locale } = useI18n()
  const tone = TONE[check.verdict]
  const copy = check.verdict === "not-found" ? t.agencies.verdicts.notFound : t.agencies.verdicts[check.verdict]

  return (
    <section
      role="status"
      aria-live="polite"
      className={cx("flex flex-col gap-3 rounded-[var(--radius-panel)] p-5", BOX[tone])}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className={cx("flex items-center gap-2.5 text-[20px] font-extrabold", TITLE[tone])}>
          <span className={cx("flex size-8 items-center justify-center rounded-full", BADGE[tone])}>
            {tone === "safe" ? <CheckIcon size={18} strokeWidth={3} /> : <AlertIcon size={17} strokeWidth={2.6} />}
          </span>
          {copy.title}
        </h2>
        <span className={cx("truncate text-[14px] font-bold", TITLE[tone])}>“{check.query}”</span>
      </div>

      {check.matches.map((agency) => (
        <div key={agency.id} className="flex flex-col gap-0.5">
          <p className="text-[17px] font-bold">{agency.name}</p>
          <p className="text-[14px] text-muted">
            {[agency.licenceNumber === null ? null : t.agencies.licence(agency.licenceNumber), agency.region]
              .filter((part) => part !== null && part !== undefined)
              .join(" · ")}
          </p>
        </div>
      ))}

      <p className="text-[15px]">{copy.body}</p>

      {check.verdict === "licensed" ? null : (
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/$locale/help/$country"
            params={{ locale, country: "ET" }}
            className="flex min-h-12 items-center justify-center rounded-full bg-ink px-4 text-center text-[15px] font-bold text-ground hover:bg-deep"
          >
            {t.agencies.verdicts.notFound.report}
          </Link>
          <Link
            to="/$locale/ask"
            params={{ locale }}
            className="flex min-h-12 items-center justify-center rounded-full bg-ground px-4 text-center text-[15px] font-bold text-ink hover:bg-surface"
          >
            {t.agencies.verdicts.notFound.ask}
          </Link>
        </div>
      )}
    </section>
  )
}
